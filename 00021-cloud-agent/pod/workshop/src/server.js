import fs from 'node:fs/promises';
import { config } from './config.js';
import { createServer } from './app.js';

await fs.mkdir(config.workshopDir, { recursive: true });

const server = createServer(config);
server.requestTimeout = config.maxTimeoutMs + 30_000;
server.listen(config.port, '0.0.0.0', () => {
  console.log(`Workshop command server listening on ${config.port}; cwd ${config.workshopDir}`);
});

const shutdown = () => {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
