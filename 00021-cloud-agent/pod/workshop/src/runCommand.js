import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

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
  return relative === '' || (relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
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
 * Run one shell command inside the workshop.
 * @returns {Promise<{exitCode: number|null, signal: number|null, output: string, timedOut: boolean, truncated: boolean, durationMs: number}>}
 */
export function runCommand({ command, cwd, timeoutMs, maxOutputBytes, env = process.env }) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const chunks = [];
    let bytes = 0;
    let truncated = false;
    let timedOut = false;
    const child = spawn('/bin/bash', ['-lc', command], {
      cwd,
      env: { ...env, PWD: cwd, TERM: 'xterm-256color' },
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const timer = setTimeout(() => {
      timedOut = true;
      try {
        process.kill(-child.pid, 'SIGKILL');
      } catch (error) {
        if (error.code !== 'ESRCH') reject(error);
      }
      child.stdout.destroy();
      child.stderr.destroy();
    }, timeoutMs);

    const collect = (chunk) => {
      if (truncated) return;
      if (bytes + chunk.length > maxOutputBytes) {
        chunks.push(chunk.subarray(0, maxOutputBytes - bytes));
        bytes = maxOutputBytes;
        truncated = true;
        return;
      }
      chunks.push(chunk);
      bytes += chunk.length;
    };
    child.stdout.on('data', collect);
    child.stderr.on('data', collect);
    child.once('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });

    child.once('close', (exitCode, signal) => {
      clearTimeout(timer);
      resolve({
        exitCode: timedOut ? null : exitCode,
        signal: signal ? os.constants.signals[signal] : null,
        output: Buffer.concat(chunks).toString('utf8').replace(ANSI, '').replace(/\r\n?/g, '\n'),
        timedOut,
        truncated,
        durationMs: Date.now() - started,
      });
    });
  });
}
