import { once } from 'node:events';
import { createInstallationToken, listInstallationRepositories } from '../services/github.service.js';
import * as tasks from '../DAO/task.dao.js';
import { taskRedis } from '../config/redis.js';
import { taskJobs } from '../services/kubernetes.service.js';
import { appendTaskEvent, decodeStreamEntry, isTerminalTask, publicTask, taskStreamKey } from '../services/task.service.js';
import { AppError } from '../utils/AppError.js';
import { sendSuccess } from '../utils/apiResponse.js';

/** List repositories available to the user's connected installation. */
export async function githubRepositories(req, res) {
  if (!req.user.installationId || req.user.installationStatus !== 'active') {
    throw new AppError(409, 'An active GitHub App installation is required');
  }
  const repositories = await listInstallationRepositories(req.user.installationId);
  res.set('Cache-Control', 'no-store');
  return sendSuccess(res, 200, 'GitHub repositories retrieved', { repositories });
}

export async function createTask(req, res) {
  if (!req.user.installationId || req.user.installationStatus !== 'active') {
    throw new AppError(409, 'An active GitHub App installation is required');
  }
  await taskRedis.get().ping();
  const repositories = await listInstallationRepositories(req.user.installationId);
  const repo = repositories.find(item => item.id === req.body.repo.id && item.htmlUrl === req.body.repo.htmlUrl);
  if (!repo) throw new AppError(403, 'Repository is not accessible to your GitHub App installation');
  const credentials = await createInstallationToken(req.user.installationId, repo.id);
  if (!(Date.parse(credentials.expires_at) > Date.now() + 45 * 60 * 1000)) {
    throw new AppError(502, 'GitHub returned insufficient token lifetime for a task');
  }
  const task = await tasks.createTask({
    owner: req.user._id, userInput: req.body.userInput, repo, installationId: req.user.installationId,
  });
  try {
    await appendTaskEvent(task._id, { agent: 'system', type: 'queued', message: 'Task queued; preparing the repository' });
    await taskJobs.create(task, credentials.token);
  } catch {
    console.error('Unable to schedule task', String(task._id));
    await tasks.updateTask(task._id, { status: 'failed', error: 'Unable to schedule task' });
    // The reconciler retries cleanup even when Kubernetes or Redis is unavailable here.
    throw new AppError(503, 'Unable to schedule task');
  }
  res.set('Cache-Control', 'no-store');
  return sendSuccess(res, 202, 'Task created', { task: publicTask(task) });
}

export async function taskEvents(req, res) {
  let task = await tasks.findOwnedTask(req.params.taskID, req.user._id);
  if (!task) throw new AppError(404, 'Task not found');
  const redis = taskRedis.get().duplicate();
  let closed = false;
  const abort = new AbortController();
  const close = () => { closed = true; abort.abort(); redis.disconnect(); };
  res.once('close', close);
  let expiry;
  let heartbeat;
  try {
    await redis.ping();
    res.status(200).set({
      'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-store',
      Connection: 'keep-alive', 'X-Accel-Buffering': 'no',
    });
    res.flushHeaders();
    const send = async (event, data, id) => {
      if (closed) return;
      if (!res.write(`${id ? `id: ${id}\n` : ''}event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)) {
        await once(res, 'drain', { signal: abort.signal });
      }
    };
    expiry = setTimeout(() => {
      if (!closed) {
        res.write('event: auth-expired\ndata: {}\n\n');
        res.end();
        close();
      }
    }, Math.max(0, req.authExpiresAt - Date.now()));
    heartbeat = setInterval(() => { if (!closed && !res.writableNeedDrain) res.write(': heartbeat\n\n'); }, 15000);
    await send('task', publicTask(task));
    let cursor = req.get('last-event-id') || '0-0';
    while (!closed) {
      const streams = await redis.xread('BLOCK', 1000, 'COUNT', 100, 'STREAMS', taskStreamKey(task._id), cursor);
      for (const [, entries] of streams || []) {
        for (const entry of entries) {
          const event = decodeStreamEntry(entry);
          await send('log', event.data, event.id);
          cursor = event.id;
        }
      }
      if (closed) break;
      if (streams?.[0]?.[1]?.length === 100) continue;
      task = await tasks.findOwnedTask(task._id, req.user._id);
      if (!task) throw new AppError(404, 'Task not found');
      if (isTerminalTask(task)) {
        const remaining = await redis.xrange(taskStreamKey(task._id), `(${cursor}`, '+');
        for (const entry of remaining) {
          const event = decodeStreamEntry(entry);
          await send('log', event.data, event.id);
        }
        await send('done', publicTask(task));
        break;
      }
    }
  } catch (error) {
    if (!closed) {
      console.error('Task event stream failed', req.params.taskID);
      if (!res.headersSent) throw error;
      res.write(`event: error\ndata: ${JSON.stringify({ message: 'Task event stream failed; reconnect to resume' })}\n\n`);
    }
  } finally {
    clearTimeout(expiry);
    clearInterval(heartbeat);
    close();
    if (res.headersSent && !res.writableEnded) res.end();
  }
}
