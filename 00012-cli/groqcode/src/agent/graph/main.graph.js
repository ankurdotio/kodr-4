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
import { list_directories, read_files, create_files, edit_files } from "../tools/file.tools.js"
import * as z from "zod"



const toolsByName = {
    [ list_directories.name ]: list_directories,
    [ read_files.name ]: read_files,
    [ create_files.name ]: create_files,
    [ edit_files.name ]: edit_files,
}


export default async function (apiKey) {
    const model = new ChatGroq({
        apiKey: apiKey,
        model: "openai/gpt-oss-120b",
        temperature: 0.3
    })

    const modelWithTool = model.bindTools([ list_directories, read_files, create_files, edit_files ])

    const LLMNode = async (state) => {
        const messages = state.messages;

        let response = null;

        while (response === null) {
            try {
                response = await modelWithTool.invoke(messages)
            } catch (error) {
                if (error?.status !== 429) {
                    throw error
                }
                console.warn("Rate limit exceeded. Retrying in 60 seconds...")
                await new Promise(resolve => setTimeout(resolve, 60_000 + Math.random() * 1000))
            }
        }

        const aiMessage = response.content;

        if (aiMessage) {
            console.log(aiMessage);
        }

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


