import { ChatOpenAI } from "@langchain/openai"
import env from "./config/env.js"
import { ChatMistralAI } from "@langchain/mistralai"


const model = new ChatOpenAI({
    // @langchain/cohere only calls Cohere's /v1/chat; newer models (e.g. command-a-plus-05-2026) are v2-only
    model: "command-a-plus-05-2026",
    apiKey: env.COHERE_API_KEY,
    configuration: {
        baseURL: "https://api.cohere.ai/compatibility/v1"
    }
})

export const nvidiaUltra = new ChatOpenAI({
    model: "nvidia/nemotron-3-ultra-550b-a55b",
    temperature: 0.7,
    apiKey: env.NVIDIA_API_KEY,
    configuration: {
        baseURL: "https://integrate.api.nvidia.com/v1"
    }
})



export default model
