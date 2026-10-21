import { StateGraph, START, END } from "@langchain/langgraph"
import * as z from "zod"
import { AIMessage } from "langchain"
import { ChatBedrockConverse } from "@langchain/aws"
import { env } from "../../../config/env.js"
import { createAssistantMessage } from "../../../DAO/message.dao.js"


const opusModel = new ChatBedrockConverse({
    model: env.bedrockDefaultModel,
    region: env.AWS_REGION,
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    }
})

/**
 * @type {StateGraph<{
 *   messages: z.infer<typeof state>["messages"],
 *   onToken: z.infer<typeof state>["onToken"],
 *   conversationId: z.infer<typeof state>["conversationId"],
 * }>}
 */
const LLMNode = async (state) => {


    const stream = await opusModel.stream(state.messages)


    let aiFullMessage = null

    for await (const chunk of stream) {
        for (const block of chunk.contentBlocks) {
            if (block.type === "text") {
                state.onToken(block.text)
            }
        }
        aiFullMessage = aiFullMessage ? aiFullMessage.concat(chunk) : chunk
    }

    await createAssistantMessage({
        conversationId: state.conversationId,
        content: aiFullMessage.content,
        toolCalls: aiFullMessage.toolCalls.map(toolCall => {
            return {
                toolName: toolCall.name,
                arguments: toolCall.args,
                tool_id: toolCall.id
            }
        })
    })

    return {
        messages: [ ...state.messages, new AIMessage({
            content: aiFullMessage.content,
            tool_calls: aiFullMessage.toolCalls.map(toolCall => {
                return {
                    name: toolCall.toolName,
                    args: toolCall.arguments,
                    id: toolCall.tool_id
                }
            })
        }) ],
        onToken: state.onToken,
        conversationId: state.conversationId,
    }


}

const state = z.object({
    messages: z.array(z.any()),
    onToken: z.function(),
    conversationId: z.string(),
})

const graph = new StateGraph(state)
    .addNode("LLMNode", LLMNode)
    .addEdge(START, "LLMNode")
    .addEdge("LLMNode", END)
    .compile()

export default graph