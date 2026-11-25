import redis from '../config/redis.js';
import { cloneRepository } from './git.js';
import { taskReporter } from './events.js';
import { writeFile } from 'node:fs/promises';

const emit = taskReporter(redis, process.env.TASK_ID, [process.env.GITHUB_TOKEN, process.env.REDIS_URL]);
try {
    await emit({ agent: 'system', type: 'cloning', message: 'Cloning the selected GitHub repository' });
    const baseSha = await cloneRepository({
        htmlUrl: process.env.REPO_HTML_URL, baseBranch: process.env.REPO_BASE_BRANCH,
        workspace: process.env.WORKSHOP_DIR, token: process.env.GITHUB_TOKEN,
    });
    await writeFile('/task/base-sha', baseSha);
    await emit({ agent: 'system', type: 'cloned', message: 'Repository cloned; starting the workshop and agent' });
} catch (error) {
    console.error('Repository initialization failed');
    process.exitCode = 1;
    await emit({ agent: 'system', type: 'failed', message: error.message });
} finally {
    redis.disconnect();
}
