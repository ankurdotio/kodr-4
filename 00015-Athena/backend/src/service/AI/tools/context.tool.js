import * as contextDAO from "../../../DAO/context.dao.js"
import { tool } from "langchain"
import * as z from "zod"


export const upsertContextTool = tool(
    async ({ name, content }, config) => {

        const userId = config.context.userId

        await contextDAO.upsertContext(userId, name, content)

        return "Context created successfully"
    },
    {
        name: "upsertContext",
        description: "Upsert context for a user",
        schema: z.object({
            name: z.string().describe("Name of the context"),
            content: z.string().describe("Content of the context")
        })
    }
)


export const readContextTool = tool(
    async ({ name }, config) => {

        const userId = config.context.userId

        const context = await contextDAO.getContext(userId, name)

        return context.content
    },
    {
        name: "readContext",
        description: "Read context for a user",
        schema: z.object({
            name: z.string().describe("Name of the context")
        })
    }
)