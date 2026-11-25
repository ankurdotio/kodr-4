import { graph } from "./src/graph/graph.js"
import redis from "./src/config/redis.js"
import env from "./src/config/env.js"

const response = await graph.invoke({
    userInput: "create a single index.html file with its boilerplate code."
}, {
    recursionLimit: 100,
    configurable: {
        emitEvent: (data) => redis.xadd(`task:${env.TASK_ID}`, "*", "event", JSON.stringify(data))
    }
})


// console.log(response)