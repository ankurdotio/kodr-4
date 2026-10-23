import { StateGraph, START, END } from "@langchain/langgraph"
import * as z from "zod"
import { AIMessage, SystemMessage } from "langchain"
import { mainAgentPrompt } from "../prompts/system.prompt.js"
import { ChatBedrockConverse } from "@langchain/aws"
import { env } from "../../../config/env.js"
import { createAssistantMessage, createToolMessage } from "../../../DAO/message.dao.js"
import { upsertContextTool, readContextTool } from "../tools/context.tool.js"
import * as ContextDAO from "../../../DAO/context.dao.js"


const toolsByName = {
    [ upsertContextTool.name ]: upsertContextTool,
    [ readContextTool.name ]: readContextTool
}

const opusModel = (new ChatBedrockConverse({
    model: env.bedrockDefaultModel,
    region: env.AWS_REGION,
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    }
})).bindTools([ upsertContextTool, readContextTool ])

/**
 * @type {StateGraph<{
 *   messages: z.infer<typeof state>["messages"],
 *   onToken: z.infer<typeof state>["onToken"],
 *   conversationId: z.infer<typeof state>["conversationId"],
 * }>}
 */
const LLMNode = async (state) => {

    console.log(state.messages[ state.messages.length - 1 ])

    const stream = await opusModel.stream([
        new SystemMessage(mainAgentPrompt({ userContext: await ContextDAO.listUserContexts(state.userId) })),
        ...state.messages
    ])


    let aiFullMessage = null

    for await (const chunk of stream) {
        for (const block of chunk.contentBlocks) {
            if (block.type === "text") {
                state.onToken(block.text)
            }
        }
        aiFullMessage = aiFullMessage ? aiFullMessage.concat(chunk) : chunk
    }


    const assistantMessage = await createAssistantMessage({
        conversationId: state.conversationId,
        content: aiFullMessage.content,
        toolCalls: aiFullMessage.tool_calls.map(toolCall => {
            return {
                toolName: toolCall.name,
                arguments: toolCall.args,
                tool_id: toolCall.id
            }
        }),
        model: env.bedrockDefaultModel
    })

    state.onComplete(assistantMessage._id)

    return {
        messages: [ ...state.messages, new AIMessage({
            content: aiFullMessage.content,
            tool_calls: aiFullMessage.tool_calls,
        }) ],
        onToken: state.onToken,
        conversationId: state.conversationId,
    }


}


const ToolNode = async (state) => {

    const lastMessage = state.messages[ state.messages.length - 1 ]

    const toolCalls = lastMessage.tool_calls || []

    console.log(toolCalls)
    const results = await Promise.all(toolCalls.map(async (toolCall) => {
        return await (toolsByName[ toolCall.name ]).invoke(toolCall, {
            context: {
                userId: state.userId
            }
        })
    }))

    await Promise.all(results.map(async (toolMessage) => {

        console.log(toolMessage)

        await createToolMessage({
            conversationId: state.conversationId,
            toolName: toolMessage.name,
            tool_id: toolMessage.tool_call_id,
            content: toolMessage.content
        })
    }))

    return {
        ...state,
        messages: [ ...state.messages, ...results ],
    }

}

const state = z.object({
    messages: z.array(z.any()),
    onToken: z.function(),
    onComplete: z.function(),
    conversationId: z.string(),
    userId: z.string()
})

const graph = new StateGraph(state)
    .addNode("LLMNode", LLMNode)
    .addNode("ToolNode", ToolNode)
    .addEdge(START, "LLMNode")
    .addEdge("ToolNode", "LLMNode")
    .addConditionalEdges("LLMNode", (state) => {

        const lastMessage = state.messages[ state.messages.length - 1 ]
        const hasToolCalls = (lastMessage.tool_calls || []).length > 0
        return hasToolCalls ? "ToolNode" : "__end__"

    }, [ "ToolNode", "__end__" ])
    .compile()

export default graph