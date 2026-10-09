import { config } from 'dotenv';
import { ChatGoogle } from "@langchain/google"

config();


const model = new ChatGoogle({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-3.8-flash"
})


const stream = await model.stream([
    { role: "user", content: "write an essay on js." }
])

for await (const chunk of stream) {
    console.log(chunk.text)
}