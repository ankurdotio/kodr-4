import mongoose from "mongoose"
import config from "./config.js"


async function connectToDB() {
    try {
        await mongoose.connect(config.MONGO_URI)
        console.log("Connected to MongoDB")
    } catch (error) {
        console.error("Failed to connect to MongoDB", error)
        process.exit(1)
    }
}

export default connectToDB