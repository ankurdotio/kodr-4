import { config } from 'dotenv';
import { ChatGoogle } from "@langchain/google"
import { HumanMessage, AIMessage } from "langchain"
import { ChatGroq } from "@langchain/groq"
import { createInterface } from "readline/promises"

config();

const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "qwen/qwen3.8-27b"
})

const rl = createInterface({
    input: process.stdin,
    output: process.stdout
})

const messages = []

while (true) {
    // –––––––––––––––– take user input –––––––––––––––––––
    const prompt = await rl.question("Enter your prompt: ")


    messages.push(new HumanMessage(prompt))

    // –––––––––––––––– send user input to model and get stream –––––––––––––––––––
    const stream = await model.stream(messages)

    let aiMessage = ""
    // –––––––––––––––– read and display the stream –––––––––––––––––––
    for await (const chunk of stream) {
        process.stdout.write(chunk.text)
        aiMessage += chunk.text
    }
    process.stdout.write("\n")

    messages.push(new AIMessage(aiMessage))
}