import Redis from 'ioredis';
import { env } from './env.js';
import { AppError } from '../utils/AppError.js';

let client;
function getRedis() {
  if (!env.redisUrl) throw new AppError(503, 'Task Redis is not configured');
  if (!client) {
    client = new Redis(env.redisUrl, {
      connectTimeout: 3000, maxRetriesPerRequest: 1,
      retryStrategy: attempt => Math.min(attempt * 200, 5000),
    });
    client.on('error', () => console.error('Task Redis connection failed'));
  }
  return client;
}

export const taskRedis = { get: getRedis, close: () => client?.disconnect() };
