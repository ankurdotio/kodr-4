import { config } from "dotenv"
config()


export default Object.freeze({
    COHERE_API_KEY: process.env.COHERE_API_KEY,
})