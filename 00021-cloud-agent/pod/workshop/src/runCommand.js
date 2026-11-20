import fs from 'node:fs/promises';
import path from 'node:path';
import pty from 'node-pty';

export class CommandError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

// eslint-disable-next-line no-control-regex
const ANSI = /\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~]|\][^\x07\x1B]*(?:\x07|\x1B\\))/g;

export function isInside(root, target) {
  const relative = path.relative(root, target);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

/** Resolve a working directory, following symlinks so it cannot escape the workshop. */
export async function resolveWorkingDirectory(root, requested = '.') {
  if (typeof requested !== 'string' || requested.includes('\0') || path.isAbsolute(requested)) {
    throw new CommandError(400, 'cwd must be a relative path inside the workshop');
  }
  const target = path.resolve(root, requested);
  if (!isInside(root, target)) throw new CommandError(400, 'cwd must be inside the workshop');
  let real;
  try {
    real = await fs.realpath(target);
  } catch {
    throw new CommandError(400, 'cwd does not exist');
  }
  if (!isInside(root, real)) throw new CommandError(400, 'cwd must stay inside the workshop');
  if (!(await fs.stat(real)).isDirectory()) throw new CommandError(400, 'cwd must be a directory');
  return real;
}

/**
 * Run one shell command in a pseudo-terminal inside the workshop.
 * @returns {Promise<{exitCode: number|null, signal: number|null, output: string, timedOut: boolean, truncated: boolean, durationMs: number}>}
 */
export function runCommand({ command, cwd, timeoutMs, maxOutputBytes, env = process.env }) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const chunks = [];
    let bytes = 0;
    let truncated = false;
    let timedOut = false;
    let child;
    try {
      child = pty.spawn('/bin/bash', ['-lc', command], {
        name: 'xterm-256color',
        cols: 200,
        rows: 50,
        cwd,
        env: { ...env, PWD: cwd, TERM: 'xterm-256color' },
      });
    } catch (error) {
      reject(error);
      return;
    }

    const timer = setTimeout(() => {
      timedOut = true;
      // The PTY child leads its own process group; kill the group so background children stop too.
      try {
        process.kill(-child.pid, 'SIGKILL');
      } catch {
        try { child.kill('SIGKILL'); } catch { /* already exited */ }
      }
    }, timeoutMs);

    child.onData((data) => {
      if (truncated) return;
      const chunk = Buffer.from(data);
      if (bytes + chunk.length > maxOutputBytes) {
        chunks.push(chunk.subarray(0, maxOutputBytes - bytes));
        bytes = maxOutputBytes;
        truncated = true;
        return;
      }
      chunks.push(chunk);
      bytes += chunk.length;
    });

    child.onExit(({ exitCode, signal }) => {
      clearTimeout(timer);
      resolve({
        exitCode: timedOut ? null : exitCode,
        signal: signal || null,
        output: Buffer.concat(chunks).toString('utf8').replace(ANSI, '').replace(/\r\n?/g, '\n'),
        timedOut,
        truncated,
        durationMs: Date.now() - started,
      });
    });
  });
}
