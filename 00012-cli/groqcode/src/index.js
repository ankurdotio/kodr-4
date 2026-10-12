import { checkApiKey, saveApiKey } from "./utils/key.utils.js";
import readline from "readline/promises"

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

export async function main(args) {

    if (!await checkApiKey()) {

        const apiKey = await rl.question("Please enter your GROQ API key: ");

        await saveApiKey(apiKey);

    }

}