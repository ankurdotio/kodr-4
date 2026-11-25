import mongoose from 'mongoose';
import { app } from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { taskRedis } from './config/redis.js';
import { startTaskReconciler } from './services/task.service.js';

try {
  await connectDB();
  const stopReconciler = env.redisUrl ? startTaskReconciler() : async () => {};
  const server = app.listen(env.port, '0.0.0.0', () => {
    console.log(`Backend listening on port ${env.port}`);
  });
  server.on('error', error => {
    console.error('HTTP server failed', error);
    process.exit(1);
  });
  let stopping = false;
  const shutdown = () => {
    if (stopping) return;
    stopping = true;
    const timeout = setTimeout(() => process.exit(1), 10000).unref();
    server.close(async () => {
      await stopReconciler();
      taskRedis.close();
      await mongoose.disconnect();
      clearTimeout(timeout);
      process.exit(0);
    });
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
} catch (error) {
  console.error('Backend startup failed', error);
  process.exit(1);
}
