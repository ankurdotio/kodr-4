import redis from "./src/config/redis.js"
import env from "./src/config/env.js"
import { taskReporter } from "./src/task/events.js"
import { runTask } from "./src/task/run.js"
import { readFile } from "node:fs/promises"

const args = process.argv.slice(2)

const emit = taskReporter(redis, env.TASK_ID, [
    process.env.GITHUB_TOKEN, process.env.REDIS_URL, env.COHERE_API_KEY, env.MISTRAL_API_KEY, env.NVIDIA_API_KEY,
])

try {
    const { graph } = await import("./src/graph/graph.js")
    if (process.env.TASK_MODE === "job") {
        await runTask({
            invoke: graph.invoke.bind(graph),
            emit,
            input: {
                userInput: process.env.TASK_INPUT, taskId: env.TASK_ID,
                workspace: env.WORKSHOP_DIR, token: process.env.GITHUB_TOKEN,
                htmlUrl: process.env.REPO_HTML_URL, fullName: process.env.REPO_FULL_NAME,
                baseBranch: process.env.REPO_BASE_BRANCH,
                baseSha: (await readFile("/task/base-sha", "utf8")).trim(),
            },
        })
    } else {
        await graph.invoke({ userInput: args[ 0 ] }, {
            recursionLimit: 3000,
            configurable: { emitEvent: emit },
        })
    }
} catch (error) {
    console.error("Agent task failed")
    process.exitCode = 1
    await emit({ agent: "system", type: "failed", message: error.message })
} finally {
    redis.disconnect()
}
