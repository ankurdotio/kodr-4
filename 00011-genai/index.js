import { config } from 'dotenv';
import { ChatGoogle } from "@langchain/google"
import { HumanMessage, AIMessage, tool, createAgent } from "langchain"
import { ChatGroq } from "@langchain/groq"
import { createInterface } from "readline/promises"
import fs from "fs/promises"
import * as z from "zod"

config();

const googleModel = new ChatGoogle({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-3.5-flash"
})

const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "openai/gpt-oss-120b"
})

const rl = createInterface({
    input: process.stdin,
    output: process.stdout
})

// ––––––––––––––––––– tools ––––––––––––––––––

const readFileTool = tool(
    async () => {
        const htmlContent = await fs.readFile("./website/index.html", "utf-8")
        const cssContent = await fs.readFile("./website/style.css", "utf-8")

        return JSON.stringify({ html: htmlContent, css: cssContent })
    },
    {
        name: "readFileTool",
        description: "Reads the HTML and CSS files from the website directory",
    }
)

const updateHtmlTool = tool(
    async ({ html }) => {
        await fs.writeFile("./website/index.html", html)
        return "html file updated"
    },
    {
        name: "updateHtmlTool",
        description: "Updates the entire HTML file.",
        schema: z.object({
            html: z.string().describe("The updated HTML content for the website")
        })
    }
)

// ––––––––––––––––––– tools ––––––––––––––––––


// ––––––––––––––––––– agent ––––––––––––––––––
const agent = createAgent({
    model,
    tools: [ readFileTool, updateHtmlTool ],
    systemPrompt: `
    You must use tools for performing the user's tasks.
    `
})

const messages = []

while (true) {
    // –––––––––––––––– take user input –––––––––––––––––––
    const prompt = await rl.question("Enter your prompt: ")

    messages.push(new HumanMessage(prompt))

    // –––––––––––––––– send user input to model and get stream –––––––––––––––––––
    const response = await agent.invoke({
        messages,
    })

    console.log(response)

    // let aiMessage = ""
    // // –––––––––––––––– read and display the stream –––––––––––––––––––
    // for await (const [ chunk ] of stream) {
    //     process.stdout.write(chunk.text)
    //     aiMessage += chunk.text
    // }
    // process.stdout.write("\n")

    // messages.push(new AIMessage(aiMessage))
}



function loginUser({ email, password }) {
    console.log("User logged in");
}

function logoutUser() {
    console.log("User logged out");
}