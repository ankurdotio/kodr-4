import { Redis } from "ioredis"
import config from "./config.js"

const redis = new Redis(config.REDIS_URI)

redis.once("connect", () => {
    console.log("Connected to Redis")
})

export default redis