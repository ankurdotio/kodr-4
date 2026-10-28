import dotenv from "dotenv"

dotenv.config()


function required(key) {
    const value = process.env[ key ]
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`)
    }
    return value
}

export default Object.freeze({
    MONGO_URI: required("MONGO_URI"),
    REDIS_URI: required("REDIS_URI")
})