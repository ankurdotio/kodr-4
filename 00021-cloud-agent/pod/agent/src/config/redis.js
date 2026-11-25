import env from "./env.js"
import Redis from "ioredis"

const redis = new Redis(env.REDIS_URL, { keepAlive: 30000 })
// ioredis reconnects automatically; failed writes still reject and fail the task.
redis.on("error", (error) => console.error(`Redis connection error: ${error.code ?? error.message}`))

export default redis
