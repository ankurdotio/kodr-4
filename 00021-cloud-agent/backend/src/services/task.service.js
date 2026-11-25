import * as tasks from '../DAO/task.dao.js';
import { taskRedis } from '../config/redis.js';
import { taskJobs } from './kubernetes.service.js';
import { AppError } from '../utils/AppError.js';

export const taskStreamKey = id => `task:${id}`;
export const isTerminalTask = task => ['completed', 'failed'].includes(task.status);
export function publicTask(task) {
  return {
    id: String(task._id), userInput: task.userInput, repo: task.repo, status: task.status,
    pullRequestUrl: task.pullRequestUrl, error: task.error, createdAt: task.createdAt,
  };
}

export function decodeStreamEntry([id, fields]) {
  const index = fields.indexOf('event');
  if (index < 0 || !fields[index + 1]) throw new AppError(502, 'Invalid task event in Redis');
  return { id, data: JSON.parse(fields[index + 1]) };
}

export async function appendTaskEvent(id, event) {
  const redis = taskRedis.get();
  await redis.xadd(taskStreamKey(id), '*', 'event', JSON.stringify(event));
}

async function finishTask(task, fields) {
  const updated = await tasks.updateTask(task._id, fields);
  await taskRedis.get().expire(taskStreamKey(task._id), 7 * 24 * 60 * 60);
  await taskJobs.delete(task._id);
  await tasks.updateTask(updated._id, { cleanupPending: false });
}

export async function reconcileTask(task) {
  if (isTerminalTask(task)) {
    if (task.status === 'failed') {
      const entries = await taskRedis.get().xrevrange(taskStreamKey(task._id), '+', '-', 'COUNT', 1);
      if (!entries.length || decodeStreamEntry(entries[0]).data.type !== 'failed') {
        await appendTaskEvent(task._id, { agent: 'system', type: 'failed', message: task.error });
      }
    }
    await taskRedis.get().expire(taskStreamKey(task._id), 7 * 24 * 60 * 60);
    await taskJobs.delete(task._id);
    await tasks.updateTask(task._id, { cleanupPending: false });
    return;
  }
  const job = await taskJobs.read(task._id);
  if (!job && Date.now() - new Date(task.createdAt).getTime() < 60000) return;
  const ended = !job || job.status?.conditions?.some(condition =>
    ['Complete', 'Failed'].includes(condition.type) && condition.status === 'True');
  if (!ended) {
    if (job.status?.active && task.status === 'pending') {
      await tasks.updateTask(task._id, { status: 'in-progress' });
    }
    return;
  }
  const entries = await taskRedis.get().xrevrange(taskStreamKey(task._id), '+', '-', 'COUNT', 1);
  const last = entries.length ? decodeStreamEntry(entries[0]).data : null;
  const prefix = `${task.repo.htmlUrl}/pull/`;
  if (last?.type === 'completed' && typeof last.pullRequestUrl === 'string' &&
      last.pullRequestUrl.startsWith(prefix) && /^[1-9]\d*$/.test(last.pullRequestUrl.slice(prefix.length))) {
    await finishTask(task, { status: 'completed', pullRequestUrl: last.pullRequestUrl });
    return;
  }
  const error = last?.type === 'failed' && typeof last.message === 'string'
    ? last.message : !job ? 'Task Job is missing' : 'Task pod failed or exceeded its 40-minute deadline before creating a PR';
  await appendTaskEvent(task._id, { agent: 'system', type: 'failed', message: error });
  await finishTask(task, { status: 'failed', error });
}

export function startTaskReconciler() {
  let running;
  const run = () => {
    if (running) return;
    running = (async () => {
      for (const task of await tasks.listUnfinishedTasks()) {
        try {
          await reconcileTask(task);
        } catch {
          console.error('Task reconciliation failed', String(task._id));
        }
      }
    })().catch(() => console.error('Unable to query unfinished tasks')).finally(() => { running = null; });
  };
  run();
  const interval = setInterval(run, 5000);
  interval.unref();
  return async () => { clearInterval(interval); await running; };
}
