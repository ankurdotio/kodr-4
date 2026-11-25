import { pushChanges } from './git.js';

export async function publishPullRequest(input, request = fetch, push = pushChanges) {
    const title = input.userInput.split(/\r?\n/)[0].slice(0, 120) || 'Cloud Agent changes';
    const branch = await push({ ...input, title });
    const response = await request(`https://api.github.com/repos/${input.fullName}/pulls`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${input.token}`, Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title, head: branch, base: input.baseBranch,
            body: `Created by Cloud Agent for task ${input.taskId}.\n\n${(input.summary || '').slice(0, 20000)}`,
        }),
        signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`GitHub PR creation failed (${response.status}); the task branch was retained`);
    const pr = await response.json();
    if (!Number.isSafeInteger(pr.number) || pr.html_url !== `${input.htmlUrl}/pull/${pr.number}`) {
        throw new Error('GitHub returned an invalid pull request');
    }
    return pr.html_url;
}

export async function runTask({ invoke, emit, input, publish = publishPullRequest }) {
    await emit({ agent: 'system', type: 'started', message: 'Agent started' });
    const result = await invoke({ userInput: input.userInput }, {
        recursionLimit: 100, configurable: { emitEvent: emit },
    });
    if (!result.testStatus) throw new Error('Agent verification failed; no PR was created');
    await emit({ agent: 'system', type: 'publishing', message: 'Verification passed; pushing changes and opening a PR' });
    const pullRequestUrl = await publish({ ...input, summary: result.mainResults });
    await emit({ agent: 'system', type: 'completed', message: 'Pull request created', pullRequestUrl });
    return pullRequestUrl;
}
