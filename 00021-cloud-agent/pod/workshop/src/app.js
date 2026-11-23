import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { CommandError, resolveWorkingDirectory, runCommand } from './runCommand.js';

const MAX_BODY_BYTES = 64 * 1024;

function send(res, statusCode, body) {
  const json = JSON.stringify(body);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(json),
    'Cache-Control': 'no-store',
  });
  res.end(json);
}

async function readJson(req) {
  if (!/^application\/json\b/i.test(req.headers['content-type'] || '')) {
    throw new CommandError(415, 'Content-Type must be application/json');
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new CommandError(413, 'Request body is too large');
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new CommandError(400, 'Invalid JSON body');
  }
}

function validate(body, config) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new CommandError(400, 'Body must be a JSON object');
  }
  const { command, cwd = '.', timeoutMs = config.defaultTimeoutMs } = body;
  if (typeof command !== 'string' || !command.trim() || command.length > 10_000 || command.includes('\0')) {
    throw new CommandError(400, 'command must be a non-empty string of at most 10000 characters');
  }
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1_000 || timeoutMs > config.maxTimeoutMs) {
    throw new CommandError(400, `timeoutMs must be an integer between 1000 and ${config.maxTimeoutMs}`);
  }
  return { command, cwd, timeoutMs };
}

/** Create the REST server that executes commands only inside the shared workshop folder. */
export function createServer(config) {
  let running = 0;

  return http.createServer(async (req, res) => {
    try {
      if (!URL.canParse(req.url, 'http://workshop')) {
        throw new CommandError(400, 'Invalid request URL');
      }
      const { pathname } = new URL(req.url, 'http://workshop');
      if (req.method === 'GET' && pathname === '/health') {
        send(res, 200, { success: true, data: { status: 'ok', workshopDir: config.workshopDir } });
        return;
      }
      if (pathname !== '/commands') throw new CommandError(404, 'Route not found');
      if (req.method !== 'POST') throw new CommandError(405, 'Method not allowed');

      const input = validate(await readJson(req), config);
      const root = await fs.realpath(config.workshopDir);
      const cwd = await resolveWorkingDirectory(root, input.cwd);
      if (running >= config.maxConcurrent) throw new CommandError(429, 'Too many commands are running');

      running += 1;
      try {
        const result = await runCommand({ ...input, cwd, maxOutputBytes: config.maxOutputBytes });
        send(res, 200, { success: true, data: { ...result, cwd: path.relative(root, cwd) || '.' } });
      } finally {
        running -= 1;
      }
    } catch (error) {
      if (error instanceof CommandError) {
        send(res, error.statusCode, { success: false, message: error.message });
      } else {
        console.error('Command server failure', error);
        send(res, 500, { success: false, message: 'Internal server error' });
      }
    }
  });
}
