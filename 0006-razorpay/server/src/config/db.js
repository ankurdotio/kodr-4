import mongoose from "mongoose";
import { env } from "./env.js";

/**
 * Connects to MongoDB using the configured connection string.
 * @returns {Promise<void>}
 */
export async function connectDB() {
    await mongoose.connect(env.mongodbUri);
    console.log("MongoDB connected");
}
