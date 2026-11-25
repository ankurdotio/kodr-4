import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readTaskEvents } from '../src/features/task/api/taskApi.js';

test('task event parsing preserves split UTF-8 content, IDs, and terminal events', async () => {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(': heartbeat\n\nid: 42-0\nevent: log\ndata: {"message":"caf\u00e9"}\n\nevent: done\ndata: {"status":"completed"}\n\n');
  const events = [];
  const stream = new ReadableStream({
    start(controller) {
      for (const byte of bytes) controller.enqueue(new Uint8Array([byte]));
      controller.close();
    },
  });
  await readTaskEvents(new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } }), event => events.push(event));
  assert.deepEqual(events, [
    { type: 'log', id: '42-0', data: { message: 'caf\u00e9' } },
    { type: 'done', id: undefined, data: { status: 'completed' } },
  ]);
});
