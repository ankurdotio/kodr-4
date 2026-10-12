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
import * as z from "zod"


const model = new ChatGroq({
    apiKey: await getAPIKey(),
    model: "openai/gpt-oss-120b"
})

const MessagesState = {
    messages: [],
    count: 0
};


/**
 * @param {MessagesState} state
 */
const LLMNode = async (state) => {
    const messages = state.messages;

    const response = await model.invoke(messages)

    return {
        messages: [ ...messages, response ],
        count: state.count + 1
    }

}

const graph = new StateGraph(z.object({
    messages: z.array(z.any()),
    count: z.number()
}))
    .addNode("LLMNode", LLMNode)
    .addEdge("__start__", "LLMNode")
    .addEdge("LLMNode", "__end__")
    .compile();

export default graph;