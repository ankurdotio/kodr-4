import mongoose from 'mongoose';
import { env } from './env.js';

/** Connect to the configured MongoDB database before the HTTP server starts.
 * @returns {Promise<typeof mongoose>}
 * @throws {Error} When MongoDB cannot be reached.
 */
export async function connectDatabase() {
    return mongoose.connect(env.mongoUri);
}