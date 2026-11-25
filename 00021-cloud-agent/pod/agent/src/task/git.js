import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const exec = promisify(execFile);
const askpass = fileURLToPath(new URL('./askpass.sh', import.meta.url));

export async function git(args, token, options = {}) {
    try {
        return await exec('git', args, {
            timeout: 120000, maxBuffer: 1024 * 1024, ...options,
            env: {
                PATH: process.env.PATH, HOME: tmpdir(), TMPDIR: tmpdir(),
                GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null', GIT_TERMINAL_PROMPT: '0',
                GIT_ASKPASS: askpass, GITHUB_TOKEN: token,
                GIT_AUTHOR_NAME: 'Cloud Agent', GIT_AUTHOR_EMAIL: 'cloud-agent[bot]@users.noreply.github.com',
                GIT_COMMITTER_NAME: 'Cloud Agent', GIT_COMMITTER_EMAIL: 'cloud-agent[bot]@users.noreply.github.com',
            },
        });
    } catch (error) {
        const command = args.find(arg => ['clone', 'init', 'fetch', 'add', 'diff', 'commit', 'push', 'rev-parse', 'read-tree', 'update-ref'].includes(arg));
        throw Object.assign(new Error(`Git ${command || 'operation'} failed (exit ${error.code})`), { code: error.code });
    }
}

export async function cloneRepository({ htmlUrl, baseBranch, workspace, token }) {
    await git(['clone', '--single-branch', '--branch', baseBranch, '--no-tags', '--', `${htmlUrl}.git`, workspace], token);
    const { stdout } = await git(['-C', workspace, 'rev-parse', 'HEAD'], token);
    return stdout.trim();
}

export async function pushChanges({ htmlUrl, baseSha, workspace, token, taskId, title }) {
    if (!/^[a-f0-9]{40,64}$/.test(baseSha || '')) throw new Error('Invalid cloned base commit');
    const directory = await mkdtemp(join(tmpdir(), 'task-publish-'));
    try {
        // Never execute hooks or filters from the agent-writable repository's .git configuration.
        await git(['init', '--bare', directory], token);
        const args = ['--git-dir', directory, '--work-tree', workspace];
        await git([...args, 'fetch', '--depth=1', `${htmlUrl}.git`, baseSha], token);
        await git([...args, 'read-tree', 'FETCH_HEAD'], token);
        // Preserve the actual base commit as the parent, not an unrelated root commit.
        await git([...args, 'update-ref', 'HEAD', baseSha], token);
        await git([...args, 'add', '--all', '--', '.'], token, { cwd: workspace });
        let changed = false;
        try {
            await git([...args, 'diff', '--cached', '--quiet', '--exit-code'], token);
        } catch (error) {
            if (error.code !== 1) throw error;
            changed = true;
        }
        if (!changed) throw new Error('The agent produced no repository changes; no PR was created');
        await git([...args, 'commit', '-m', title], token);
        const branch = `cloud-agent/${taskId}`;
        await git([...args, 'push', `${htmlUrl}.git`, `HEAD:refs/heads/${branch}`], token);
        return branch;
    } finally {
        await rm(directory, { recursive: true, force: true });
    }
}
