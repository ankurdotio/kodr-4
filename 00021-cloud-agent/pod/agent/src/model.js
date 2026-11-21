import { ChatOpenAI } from "@langchain/openai"
import env from "./config/env.js"


const model = new ChatOpenAI({
    // @langchain/cohere only calls Cohere's /v1/chat; newer models (e.g. command-a-plus-05-2026) are v2-only
    model: "command-a-plus-05-2026",
    apiKey: env.COHERE_API_KEY,
    configuration: {
        baseURL: "https://api.cohere.ai/compatibility/v1"
    }
})

export default model
