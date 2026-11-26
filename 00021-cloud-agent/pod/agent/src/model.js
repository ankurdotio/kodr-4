import { ChatOpenAI } from "@langchain/openai"
import env from "./config/env.js"
import { ChatMistralAI } from "@langchain/mistralai"
import { ChatBedrockConverse } from "@langchain/aws"


const model = new ChatOpenAI({
    // @langchain/cohere only calls Cohere's /v1/chat; newer models (e.g. command-a-plus-05-2026) are v2-only
    model: "command-a-plus-05-2026",
    // Constrains tool calls to the bound tools and their schemas; Cohere returns 422 for invented tools otherwise.
    supportsStrictToolCalling: true,
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

export const bedrockModel = new ChatBedrockConverse({
    model: "arn:aws:bedrock:ap-south-1:329599656829:inference-profile/global.anthropic.claude-opus-4-5-20251101-v1:0",
    region: "ap-south-1",
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY
    }
})



export default model
