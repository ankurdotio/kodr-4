import env from "./env.js"
import Redis from "ioredis"

const redis = new Redis(env.REDIS_URL)

export default redis
