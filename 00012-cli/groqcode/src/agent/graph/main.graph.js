import {
    StateGraph,
    StateSchema,
    MessagesValue,
    ReducedValue,
    START,
    END,
} from "@langchain/langgraph";
import { getAPIKey } from "../../utils/key.utils.js"
import { ChatGroq } from "@langchain/groq"
import { tool } from "langchain"
import * as z from "zod"

const readHtmlFile = tool(
    async () => {
        return "<html></html>";
    },
    {
        name: "readHtmlFile",
        description: "Reads the HTML file",
        schema: z.object({})
    }
)

const toolsByName = {
    [ readHtmlFile.name ]: readHtmlFile
}


export default async function (apiKey) {
    const model = new ChatGroq({
        apiKey: apiKey,
        model: "openai/gpt-oss-120b",
        temperature: 0.3
    })

    const modelWithTool = model.bindTools([ readHtmlFile ])

    const LLMNode = async (state) => {
        const messages = state.messages;

        const response = await modelWithTool.invoke(messages)

        return {
            messages: [ ...messages, response ],
            count: state.count + 1
        }
    }

    const toolNode = async (state) => {
        const lastMessage = state.messages[ state.messages.length - 1 ];

        const toolCalls = lastMessage.tool_calls

        const toolResponses = toolCalls.map(async toolCall => {
            const tool = toolsByName[ toolCall.name ]
            const response = await tool.invoke(toolCall)
            return response;
        })

        return {
            messages: [ ...state.messages, ...(await Promise.all(toolResponses)) ]
        }
    }



    const graph = new StateGraph(z.object({
        messages: z.array(z.any()),
        count: z.number()
    }))
        .addNode("LLMNode", LLMNode)
        .addNode("ToolNode", toolNode)
        .addEdge("__start__", "LLMNode")
        .addEdge("ToolNode", "LLMNode")
        .addConditionalEdges("LLMNode", async (state) => {
            const lastMessage = state.messages[ state.messages.length - 1 ];

            const toolCalls = lastMessage.tool_calls

            if (toolCalls && toolCalls.length > 0) {
                return "ToolNode"
            } else {
                return END
            }
        }, [ "ToolNode", END ])
        .compile();

    return graph;
}



