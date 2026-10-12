import { checkApiKey, saveApiKey, getAPIKey } from "./utils/key.utils.js";
import readline from "readline/promises"
import initiateGraph from "./agent/graph/main.graph.js"
import { HumanMessage, SystemMessage } from "langchain"

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

export async function main(args) {

    if (!await checkApiKey()) {

        const apiKey = await rl.question("Please enter your GROQ API key: ");

        await saveApiKey(apiKey);

    }
    const graph = await initiateGraph(await getAPIKey())

    const prompt = await rl.question("Please enter your prompt: ");

    const response = await graph.invoke({
        messages: [
            new SystemMessage("You must use the tools available to you. for performing the user's tasks."),
            new HumanMessage(prompt)
        ],
        count: 1
    })

    console.log(response);

}