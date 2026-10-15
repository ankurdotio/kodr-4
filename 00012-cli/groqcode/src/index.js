import { checkApiKey, saveApiKey, getAPICredentials } from "./utils/key.utils.js";
import readline from "readline/promises"
import initiateGraph from "./agent/graph/main.graph.js"
import { HumanMessage, SystemMessage } from "langchain"

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

export async function main(args) {

    if (!await checkApiKey()) {

        const accessKeyId = await rl.question("Please enter your AWS Access Key ID: ");
        const secretAccessKey = await rl.question("Please enter your AWS Secret Access Key: ");
        const region = await rl.question("Please enter your AWS Region: ");

        await saveApiKey({ accessKeyId, secretAccessKey, region });

    }
    const graph = await initiateGraph(await getAPICredentials())

    let messages = []

    while (true) {
        const prompt = await rl.question("Please enter your prompt: ");

        if (messages.length > 0) {
            messages.push(new HumanMessage(prompt));
        }

        const response = await graph.invoke({
            messages: messages.length > 0 ? messages : [
                new SystemMessage(`
                You must use the tools available to you. for performing the user's tasks.
                current working directory is ${process.cwd()}
                `),
                new HumanMessage(prompt)
            ],
            count: 1
        })

        messages = response.messages;
    }

}