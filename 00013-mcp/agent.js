import { config } from "dotenv"
import { ChatGroq } from "@langchain/groq"
import { MCPAdapter } from "@langchain/mcp-adapters";
import { createAgent, tool } from "langchain";

config()


const model = new ChatGroq({
    model: "openai/gpt-oss-120b",
    apiKey: process.env.GROQ_API_KEY,
    temperature: 0.7
})


const adapter = new MCPAdapter({
    servers: {
        // Local server: adapter spawns it as a child process (stdio)
        calendar: {
            command: "node",
            args: [ "./server.js" ],
        },
        // Remote server: Streamable HTTP is the default for a url
        docs: {
            url: "https://docs.langchain.com/mcp",
        },
    },
});


const tools = await adapter.listTools()



const agent = createAgent({
    model,
    tools
})

const response = await agent.invoke({
    messages: [
        {
            role: "human",
            content: "what are guardrails in langchain"
        }
    ]
})

console.log(response)