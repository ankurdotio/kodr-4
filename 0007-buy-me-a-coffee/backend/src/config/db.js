import mongoose from "mongoose";
import { env } from "./env.js";

/**
 * Connects to MongoDB using the configured URI.
 * @returns {Promise<void>}
 * @throws {Error} When the connection cannot be established.
 */
export async function connectDB() {
  await mongoose.connect(env.MONGODB_URI);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}
