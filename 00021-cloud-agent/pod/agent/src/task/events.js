export function taskReporter(redis, taskId, secrets = []) {
    return async event => {
        let json = JSON.stringify(event);
        for (const secret of secrets.filter(value => typeof value === 'string' && value.length > 3)) {
            json = json.replaceAll(secret, '[REDACTED]');
        }
        await redis.xadd(`task:${taskId}`, '*', 'event', json);
        await redis.expire(`task:${taskId}`, 7 * 24 * 60 * 60);
    };
}
