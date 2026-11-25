import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { cloneRepository, pushChanges } from '../src/task/git.js';
import { publishPullRequest, runTask } from '../src/task/run.js';
import { taskReporter } from '../src/task/events.js';

const exec = promisify(execFile);

test('task completion is emitted only after verification and a PR exists', async () => {
    const events = [];
    let published = false;
    const emit = async event => {
        if (event.type === 'completed') assert.equal(published, true);
        events.push(event);
    };
    await runTask({
        input: { userInput: 'Build a page' }, emit,
        invoke: async () => ({ testStatus: true, mainResults: 'Built and verified' }),
        publish: async () => { published = true; return 'https://github.com/owner/repo/pull/1'; },
    });
    assert.equal(events.at(-1).type, 'completed');
    await assert.rejects(runTask({
        input: {}, emit, invoke: async () => ({ testStatus: false }),
        publish: () => assert.fail('Failed verification must not create a PR'),
    }), /verification failed/);
    await assert.rejects(runTask({
        input: {}, emit, invoke: async () => ({ testStatus: true }),
        publish: async () => { throw new Error('PR failed'); },
    }), /PR failed/);
    assert.equal(events.filter(event => event.type === 'completed').length, 1);
});

test('PR publication uses the selected repository, branch, and GitHub token', async () => {
    const input = {
        taskId: 'abc', userInput: 'Add a page', fullName: 'owner/repo',
        htmlUrl: 'https://github.com/owner/repo', baseBranch: 'main', token: 'scoped-token',
    };
    const request = async (url, options) => {
        assert.equal(url, 'https://api.github.com/repos/owner/repo/pulls');
        assert.equal(options.headers.Authorization, 'Bearer scoped-token');
        assert.equal(JSON.parse(options.body).head, 'cloud-agent/abc');
        assert.equal(JSON.parse(options.body).base, 'main');
        return { ok: true, json: async () => ({ number: 7, html_url: `${input.htmlUrl}/pull/7` }) };
    };
    assert.equal(await publishPullRequest(input, request, async () => 'cloud-agent/abc'), `${input.htmlUrl}/pull/7`);
});

test('task event logging redacts credentials and retains events after pod deletion', async () => {
    const writes = [];
    const emit = taskReporter({
        xadd: async (...args) => writes.push(args),
        expire: async (key, seconds) => assert.equal(seconds, 604800),
    }, 'abc', ['secret-github-token']);
    await emit({ content: { tool_calls: [{ args: 'secret-github-token' }] } });
    assert.equal(writes[0][0], 'task:abc');
    assert.equal(writes[0].at(-1).includes('secret-github-token'), false);
    assert.match(writes[0].at(-1), /REDACTED/);
});

test('clone and publish preserve the cloned base and ignore the workspace Git configuration', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'cloud-agent-git-test-'));
    const seed = join(directory, 'seed');
    const remote = join(directory, 'remote.git');
    const workspace = join(directory, 'workspace');
    const run = (args, cwd = directory) => exec('git', args, { cwd });
    try {
        await mkdir(seed);
        await run(['init', '--initial-branch=main'], seed);
        await writeFile(join(seed, 'index.js'), 'original\n');
        await run(['add', '.'], seed);
        await run(['-c', 'user.name=Test', '-c', 'user.email=test@example.com', 'commit', '-m', 'Initial'], seed);
        await run(['clone', '--bare', seed, remote]);
        const htmlUrl = remote.slice(0, -4);
        const baseSha = await cloneRepository({ htmlUrl, baseBranch: 'main', workspace, token: '' });
        // Simulate the remote advancing while the agent is working.
        await writeFile(join(seed, 'upstream.js'), 'upstream\n');
        await run(['add', '.'], seed);
        await run(['-c', 'user.name=Test', '-c', 'user.email=test@example.com', 'commit', '-m', 'Upstream'], seed);
        await run(['push', remote, 'main'], seed);
        await writeFile(join(workspace, 'index.js'), 'changed\n');
        await writeFile(join(workspace, '.git', 'config'), '[core]\nrepositoryformatversion = 999\n');
        const branch = await pushChanges({ htmlUrl, workspace, baseSha, token: '', taskId: 'abc', title: 'Agent changes' });
        assert.equal(branch, 'cloud-agent/abc');
        const parent = await run(['--git-dir', remote, 'rev-parse', `${branch}^`]);
        assert.equal(parent.stdout.trim(), baseSha);
        const content = await run(['--git-dir', remote, 'show', `${branch}:index.js`]);
        assert.equal(content.stdout, 'changed\n');
        await writeFile(join(workspace, 'index.js'), 'original\n');
        await assert.rejects(pushChanges({ htmlUrl, workspace, baseSha, token: '', taskId: 'empty', title: 'No changes' }), /no repository changes/);
    } finally {
        await rm(directory, { recursive: true, force: true });
    }
});
