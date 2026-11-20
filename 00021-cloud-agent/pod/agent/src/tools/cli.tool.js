import { tool } from "langchain"
import * as z from "zod"
import env from "../config/env.js"

const REQUEST_GRACE_MS = 10_000

/**
 * Ask the workshop container to run a command inside the shared workshop folder.
 * @param {{ command: string, cwd?: string, timeoutMs?: number }} input
 * @returns {Promise<object>} Command output, exit code, signal, timeout, and truncation status.
 * @throws {Error} When the workshop server is unavailable or rejects the request.
 */
export async function runWorkshopCommand({ command, cwd = ".", timeoutMs = 120_000 }) {
    let response
    try {
        response = await fetch(new URL("/commands", env.WORKSHOP_SERVER_URL), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ command, cwd, timeoutMs }),
            signal: AbortSignal.timeout(timeoutMs + REQUEST_GRACE_MS),
        })
    } catch (error) {
        throw new Error(`Workshop server request failed: ${error.message}`)
    }

    const body = await response.json().catch(() => null)
    if (!response.ok || !body?.success) {
        throw new Error(body?.message || `Workshop server returned HTTP ${response.status}`)
    }
    return body.data
}

export const runCommandTool = tool(runWorkshopCommand, {
    name: "run_command",
    description: "Run a bash command in the workshop container. Commands always execute inside the shared workshop folder; cwd may select a subfolder.",
    schema: z.object({
        command: z.string().min(1).max(10_000).describe("Bash command to execute"),
        cwd: z.string().optional().describe("Optional path relative to the workshop folder"),
        timeoutMs: z.number().int().min(1_000).max(600_000).optional().describe("Timeout in milliseconds, default 120000"),
    }),
})

export const cliTools = [runCommandTool]
