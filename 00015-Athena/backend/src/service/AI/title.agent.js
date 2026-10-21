import { ChatBedrockConverse } from "@langchain/aws"
import { createAgent, providerStrategy, SystemMessage, HumanMessage } from "langchain"
import { env } from "../../config/env.js";
import * as z from "zod";
import { model } from "mongoose";

const mistrallMini = new ChatBedrockConverse({
    model: env.TITLE_GENERATION_MODEL,
    region: env.AWS_REGION,
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    }
})

// export const titleAgent = createAgent({
//     model: mistrallMini,
//     systemPrompt: `You have to generate a title of length between 3 to 6 words.
//     You have to follow these 5 rules while generating the title:
//     1. The title should be relevant to the content of the conversation.
//     2. The title should be based on the user's first message.
//     3. The title should be in English language.
//     4. The title should be in Title Case format.
//     5. The title should not contain any special characters or punctuation marks.
//     `,
//     responseFormat: providerStrategy()
// })

export const generateTitle = async (message) => {

    const structuredModel = mistrallMini.withStructuredOutput(
        z.object({
            title: z.string().min(3).max(80).regex(/^[A-Za-z0-9 ]+$/)
        })
    )

    const titleResponse = await structuredModel.invoke(
        [
            new SystemMessage(`You have to generate a title of length between 3 to 6 words.
            You have to follow these 5 rules while generating the title:
            1. The title should be relevant to the content of the conversation.
            2. The title should be based on the user's first message.
            3. The title should be in English language.
            4. The title should be in Title Case format.
            5. The title should not contain any special characters or punctuation marks.
            !Important: Use tool for generating title.
            `),
            new HumanMessage(message)
        ]
    )

    console.log("Title Response: ", titleResponse)

    return titleResponse.title
}
