import path from 'node:path';

function integer(name, fallback, min, max) {
  const value = Number(process.env[ name ] ?? fallback);
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${name} must be an integer between ${min} and ${max}`);
  }
  return value;
}

export const config = Object.freeze({
  port: integer('PORT', 4000, 1, 65535),
  workshopDir: path.resolve(process.env.WORKSHOP_DIR || '/workshop'),
  defaultTimeoutMs: integer('DEFAULT_TIMEOUT_MS', 120_000, 1_000, 600_000),
  maxTimeoutMs: integer('MAX_TIMEOUT_MS', 600_000, 1_000, 3_600_000),
  maxOutputBytes: integer('MAX_OUTPUT_BYTES', 1_000_000, 1_024, 10_000_000),
  maxConcurrent: integer('MAX_CONCURRENT_COMMANDS', 4, 1, 64),
});
