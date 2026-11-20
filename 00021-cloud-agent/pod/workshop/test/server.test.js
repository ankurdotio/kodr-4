import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createServer } from '../src/app.js';

let dir;
let server;
let url;

before(async () => {
  dir = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'workshop-test-')));
  await fs.mkdir(path.join(dir, 'sub'));
  await fs.symlink(os.tmpdir(), path.join(dir, 'escape'));
  server = createServer({
    workshopDir: dir,
    defaultTimeoutMs: 10_000,
    maxTimeoutMs: 20_000,
    maxOutputBytes: 1_024,
    maxConcurrent: 2,
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  url = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await fs.rm(dir, { recursive: true, force: true });
});

const run = (body) => fetch(`${url}/commands`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

test('runs in the workshop folder and returns output and exit code', async () => {
  const response = await run({ command: 'pwd; echo hello; exit 3' });
  const { data } = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.exitCode, 3);
  assert.equal(data.output, `${dir}\nhello\n`);
});

test('allows workshop subdirectories but rejects escapes', async () => {
  const { data } = await (await run({ command: 'pwd', cwd: 'sub' })).json();
  assert.equal(data.output, `${path.join(dir, 'sub')}\n`);
  for (const cwd of ['..', '/tmp', 'escape', 'missing']) {
    assert.equal((await run({ command: 'pwd', cwd })).status, 400, cwd);
  }
});

test('times out runaway commands and truncates large output', async () => {
  const slow = (await (await run({ command: 'sleep 5', timeoutMs: 1_000 })).json()).data;
  assert.equal(slow.timedOut, true);
  assert.equal(slow.exitCode, null);

  const big = (await (await run({ command: 'head -c 5000 /dev/zero | tr "\\0" a' })).json()).data;
  assert.equal(big.truncated, true);
  assert.ok(Buffer.byteLength(big.output) <= 1_024);
});

test('validates requests', async () => {
  assert.equal((await run({ command: '' })).status, 400);
  assert.equal((await fetch(`${url}/commands`, { method: 'POST', body: '{}' })).status, 415);
  assert.equal((await fetch(`${url}/health`)).status, 200);
});
