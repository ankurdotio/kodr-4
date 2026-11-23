import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { createServer } from '../src/app.js';
import { runCommand } from '../src/runCommand.js';

let dir;
let server;
let url;

before(async () => {
  dir = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'workshop-test-')));
  await fs.mkdir(path.join(dir, 'sub'));
  await fs.mkdir(path.join(dir, '..repo'));
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

test('captures stdout and stderr without a terminal', async () => {
  const { data } = await (await run({
    command: 'printf "stdout\\n"; printf "stderr\\n" >&2; test ! -t 0 && test ! -t 1 && test ! -t 2',
  })).json();
  assert.equal(data.exitCode, 0);
  assert.match(data.output, /stdout\n/);
  assert.match(data.output, /stderr\n/);
});

test('preserves numeric termination signals', async () => {
  const { data } = await (await run({ command: 'kill -TERM $$' })).json();
  assert.equal(data.exitCode, null);
  assert.equal(data.signal, os.constants.signals.SIGTERM);
  assert.equal(data.timedOut, false);
});

test('reports spawn errors', async () => {
  await assert.rejects(
    runCommand({ command: 'true', cwd: path.join(dir, 'missing'), timeoutMs: 1_000, maxOutputBytes: 1_024 }),
    { code: 'ENOENT' },
  );
});

test('allows workshop subdirectories but rejects escapes', async () => {
  const { data } = await (await run({ command: 'pwd', cwd: 'sub' })).json();
  assert.equal(data.output, `${path.join(dir, 'sub')}\n`);
  for (const cwd of ['..', '/tmp', 'escape', 'missing']) {
    assert.equal((await run({ command: 'pwd', cwd })).status, 400, cwd);
  }
});

test('allows directory names starting with two dots inside the workshop', async () => {
  const response = await run({ command: 'pwd', cwd: '..repo' });
  const { data } = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.cwd, '..repo');
  assert.equal(data.output, `${path.join(dir, '..repo')}\n`);
});

test('rejects malformed request targets without stopping the server', async () => {
  const result = await new Promise((resolve, reject) => {
    const req = http.get(`${url}/`, { path: '//[' }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
      res.on('error', reject);
    });
    req.on('error', reject);
  });
  assert.equal(result.status, 400);
  assert.equal(result.body.success, false);
  assert.equal((await fetch(`${url}/health`)).status, 200);
});

test('times out runaway commands and truncates large output', async () => {
  const slow = (await (await run({ command: 'sleep 5', timeoutMs: 1_000 })).json()).data;
  assert.equal(slow.timedOut, true);
  assert.equal(slow.exitCode, null);
  assert.equal(slow.signal, os.constants.signals.SIGKILL);

  const big = (await (await run({ command: 'head -c 5000 /dev/zero | tr "\\0" a >&2' })).json()).data;
  assert.equal(big.truncated, true);
  assert.ok(Buffer.byteLength(big.output) <= 1_024);
});

test('times out and kills background processes that keep output pipes open', async () => {
  const marker = path.join(dir, 'background-finished');
  const { data } = await (await run({
    command: '(sleep 1.5; echo survived > background-finished) &',
    timeoutMs: 1_000,
  })).json();
  assert.equal(data.timedOut, true);
  assert.equal(data.exitCode, null);
  await new Promise((resolve) => setTimeout(resolve, 800));
  await assert.rejects(fs.access(marker), { code: 'ENOENT' });
});

test('validates requests', async () => {
  assert.equal((await run({ command: '' })).status, 400);
  assert.equal((await fetch(`${url}/commands`, { method: 'POST', body: '{}' })).status, 415);
  assert.equal((await fetch(`${url}/health`)).status, 200);
});
