import mongoose from 'mongoose';
import { env } from './env.js';

/** Connect to MongoDB before accepting requests.
 * @returns {Promise<typeof mongoose>} Connected Mongoose instance.
 * @throws {Error} If MongoDB cannot be reached.
 */
export async function connectDB() {
  const connection = await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 10000 });
  await Promise.all(Object.values(mongoose.models).map(model => model.init()));
  return connection;
}

/** Report database readiness without exposing the database driver to controllers.
 * @returns {boolean} Whether the MongoDB connection is ready.
 */
export function isDatabaseReady() {
  return mongoose.connection.readyState === 1;
}
