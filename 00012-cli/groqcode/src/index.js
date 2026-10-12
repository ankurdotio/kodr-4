import { checkApiKey, saveApiKey } from "./utils/key.utils.js";
import readline from "readline/promises"
import graph from "./agent/graph/main.graph.js"
import { HumanMessage } from "langchain"

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

export async function main(args) {

    if (!await checkApiKey()) {

        const apiKey = await rl.question("Please enter your GROQ API key: ");

        await saveApiKey(apiKey);

    }

    const prompt = await rl.question("Please enter your prompt: ");

    const response = await graph.invoke({
        messages: [ new HumanMessage(prompt) ],
        count: 1
    })

    console.log(response);

}