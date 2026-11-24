import { config } from "dotenv"
config()


export default Object.freeze({
    COHERE_API_KEY: process.env.COHERE_API_KEY,
    WORKSHOP_DIR: process.env.WORKSHOP_DIR || "/workshop",
    WORKSHOP_SERVER_URL: process.env.WORKSHOP_SERVER_URL || "http://workshop:4000",
    REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
    TASK_ID: process.env.TASK_ID || "default-task-id"
})