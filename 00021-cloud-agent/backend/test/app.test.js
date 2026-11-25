import { after, before, test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac, generateKeyPairSync, randomUUID } from 'node:crypto';
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
Object.assign(process.env, {
  NODE_ENV: 'test',
  MONGODB_URI: 'mongodb://127.0.0.1:27017/unused',
  GITHUB_CLIENT_ID: 'test-client-id',
  GITHUB_APP_ID: '12345',
  GITHUB_APP_PRIVATE_KEY: Buffer.from(privateKey.export({ type: 'pkcs8', format: 'pem' })).toString('base64'),
  GITHUB_CLIENT_SECRET: 'test-client-secret',
  GITHUB_WEBHOOK_SECRET: 'test-webhook-secret',
  GITHUB_APP_SLUG: 'exlantern',
  ACCESS_TOKEN_SECRET: 'a'.repeat(48),
  REFRESH_TOKEN_SECRET: 'b'.repeat(48),
  FRONTEND_ORIGIN: 'http://localhost:5173',
});

const { app } = await import('../src/app.js');
const { env, readEnv } = await import('../src/config/env.js');
const { passport } = await import('../src/config/passport.js');
const { issueTokens, verifyToken, hashToken, signContext } = await import('../src/utils/jwt.js');
const { verifyWebhookSignature } = await import('../src/utils/webhook.js');
const { AppError } = await import('../src/utils/AppError.js');
const { errorMiddleware } = await import('../src/middleware/error.middleware.js');
const users = await import('../src/DAO/user.dao.js');
const events = await import('../src/DAO/event.dao.js');
const { UserModel } = await import('../src/models/user.model.js');
const { EventModel } = await import('../src/models/event.model.js');
const { default: Task } = await import('../src/models/task.model.js');
const { taskJobs, buildTaskJob } = await import('../src/services/kubernetes.service.js');
const { taskRedis } = await import('../src/config/redis.js');
const { reconcileTask } = await import('../src/services/task.service.js');

const database = `cloud_agent_test_${randomUUID().replaceAll('-', '')}`;
const integration = { skip: !process.env.TEST_MONGODB_URI };
const id = '507f1f77bcf86cd799439011';

before(async () => {
  if (process.env.TEST_MONGODB_URI) {
    await mongoose.connect(process.env.TEST_MONGODB_URI, { dbName: database, serverSelectionTimeoutMS: 10000 });
    await Promise.all([UserModel.init(), EventModel.init()]);
  }
});

after(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});

test('configuration rejects missing values, weak secrets, invalid app IDs, and unsafe production origins', () => {
  assert.throws(() => readEnv({}), /MONGODB_URI/);
  assert.throws(() => readEnv({ ...process.env, ACCESS_TOKEN_SECRET: 'short' }), /32 characters/);
  assert.throws(() => readEnv({ ...process.env, GITHUB_APP_ID: 'exlantern' }), /numeric/);
  assert.throws(() => readEnv({ ...process.env, NODE_ENV: 'production' }), /HTTPS/);
  assert.equal(Object.isFrozen(readEnv(process.env)), true);
});

test('JWT rotation is unique and audiences cannot be interchanged', () => {
  const first = issueTokens({ _id: id, githubId: '77' });
  const second = issueTokens({ _id: id, githubId: '77' });
  assert.notEqual(first.refreshToken, second.refreshToken);
  assert.equal(verifyToken(first.accessToken, 'access').id, id);
  assert.equal(verifyToken(first.refreshToken, 'refresh').id, id);
  assert.throws(() => verifyToken(first.refreshToken, 'access'));
  assert.throws(() => verifyToken(signContext({ id }, 'oauth'), 'refresh'));
  const payload = jwt.decode(first.accessToken);
  assert.equal(payload.exp - payload.iat, 900);
  const refresh = jwt.decode(first.refreshToken);
  assert.equal(refresh.exp - refresh.iat, 604800);
});

test('signature validation uses original bytes and rejects tampering or malformed signatures', () => {
  const raw = Buffer.from('{"action": "opened"}');
  const signature = `sha256=${createHmac('sha256', env.githubWebhookSecret).update(raw).digest('hex')}`;
  assert.doesNotThrow(() => verifyWebhookSignature(raw, signature, env.githubWebhookSecret));
  assert.throws(() => verifyWebhookSignature(Buffer.from('{"action":"opened"}'), signature, env.githubWebhookSecret), /Invalid webhook/);
  for (const invalid of ['', 'sha256=00', 'sha1=123', `sha256=${'z'.repeat(64)}`]) {
    assert.throws(() => verifyWebhookSignature(raw, invalid, env.githubWebhookSecret), /Invalid webhook/);
  }
});

test('public health, missing routes, malformed JSON, and missing authentication follow envelopes', async () => {
  const health = await request(app).get('/api/v1/health/live').expect(200);
  assert.deepEqual(health.body, { success: true, message: 'Server is running', data: { status: 'ok' } });
  for (const path of ['/api/v1/auth/me', '/api/v1/activity', '/api/v1/task/github/repos']) {
    const response = await request(app).get(path).expect(401);
    assert.equal(response.body.success, false);
    assert.deepEqual(response.body.errors, []);
    assert.equal('data' in response.body, false);
  }
  const missing = await request(app).get('/not-here').expect(404);
  assert.equal(missing.body.message, 'Route not found');
  const malformed = await request(app).post('/api/v1/auth/refresh').set('Content-Type', 'application/json').send('{').expect(400);
  assert.equal(malformed.body.message, 'Invalid JSON body');
});

test('repository endpoint uses the connected installation token and returns every page', async () => {
  const user = { _id: id, githubId: '77', installationId: 555, installationStatus: 'active' };
  const userMock = mock.method(UserModel, 'findById', () => ({ lean: async () => user }));
  const repo = index => ({
    id: index, name: `repo-${index}`, full_name: `owner/repo-${index}`,
    private: true, html_url: `https://github.com/owner/repo-${index}`, default_branch: 'main',
    extra: 'not returned',
  });
  const fetchMock = mock.method(globalThis, 'fetch', async (url, options) => {
    if (url.endsWith('/access_tokens')) {
      assert.equal(url, 'https://api.github.com/app/installations/555/access_tokens');
      assert.equal(options.method, 'POST');
      const claims = jwt.verify(options.headers.Authorization.slice(7), publicKey, { algorithms: ['RS256'] });
      assert.equal(claims.iss, '12345');
      return { ok: true, json: async () => ({ token: 'installation-token' }) };
    }
    assert.equal(options.headers.Authorization, 'Bearer installation-token');
    const page = new URL(url).searchParams.get('page');
    return { ok: true, json: async () => ({
      repositories: page === '1' ? Array.from({ length: 100 }, (_, i) => repo(i + 1)) : [repo(101)],
    }) };
  });
  try {
    const { accessToken } = issueTokens(user);
    const response = await request(app).get('/api/v1/task/github/repos').auth(accessToken, { type: 'bearer' }).expect(200);
    assert.equal(response.headers['cache-control'], 'no-store');
    assert.equal(response.body.data.repositories.length, 101);
    assert.deepEqual(response.body.data.repositories[100], {
      id: 101, name: 'repo-101', fullName: 'owner/repo-101', private: true,
      htmlUrl: 'https://github.com/owner/repo-101', defaultBranch: 'main',
    });
    assert.equal(fetchMock.mock.callCount(), 3);
  } finally {
    userMock.mock.restore();
    fetchMock.mock.restore();
  }
});

test('repository endpoint rejects inactive installations and GitHub failures', async () => {
  const user = { _id: id, githubId: '77', installationId: 555, installationStatus: 'suspended' };
  const userMock = mock.method(UserModel, 'findById', () => ({ lean: async () => user }));
  const fetchMock = mock.method(globalThis, 'fetch', async () => ({ ok: false, status: 403 }));
  const log = mock.method(console, 'error', () => {});
  try {
    const { accessToken } = issueTokens(user);
    await request(app).get('/api/v1/task/github/repos').auth(accessToken, { type: 'bearer' }).expect(409);
    assert.equal(fetchMock.mock.callCount(), 0);
    user.installationStatus = 'active';
    const response = await request(app).get('/api/v1/task/github/repos').auth(accessToken, { type: 'bearer' }).expect(502);
    assert.equal(response.body.message, 'Unable to retrieve GitHub repositories');
  } finally {
    userMock.mock.restore();
    fetchMock.mock.restore();
    log.mock.restore();
  }
});

test('repository endpoint rejects malformed GitHub repository responses', async () => {
  const user = { _id: id, githubId: '77', installationId: 555, installationStatus: 'active' };
  const userMock = mock.method(UserModel, 'findById', () => ({ lean: async () => user }));
  const fetchMock = mock.method(globalThis, 'fetch', async url => ({
    ok: true, json: async () => url.endsWith('/access_tokens')
      ? { token: 'installation-token' } : { repositories: [null] },
  }));
  try {
    const { accessToken } = issueTokens(user);
    const response = await request(app).get('/api/v1/task/github/repos').auth(accessToken, { type: 'bearer' }).expect(502);
    assert.equal(response.body.message, 'Invalid response from GitHub');
  } finally {
    userMock.mock.restore();
    fetchMock.mock.restore();
  }
});

test('task APIs require authentication, validate input, and conceal tasks belonging to other users', async t => {
  await request(app).post('/api/v1/task').send({}).expect(401);
  await request(app).get(`/api/v1/task/event/${id}`).expect(401);
  t.mock.method(UserModel, 'findById', () => ({ lean: async () => ({ _id: id }) }));
  const { accessToken } = issueTokens({ _id: id, githubId: '77' });
  const invalid = await request(app).post('/api/v1/task').auth(accessToken, { type: 'bearer' })
    .send({ userInput: ' ', repo: { id: '42', htmlUrl: 'https://other.example/repo' } }).expect(422);
  assert.ok(invalid.body.errors.some(error => error.field === 'repo.id'));
  await request(app).get('/api/v1/task/event/bad-id').auth(accessToken, { type: 'bearer' }).expect(422);
  t.mock.method(Task, 'findOne', filter => {
    assert.equal(String(filter.owner), id);
    return { lean: async () => null };
  });
  await request(app).get(`/api/v1/task/event/${id}`).auth(accessToken, { type: 'bearer' }).expect(404);
});

function fakeTaskRedis(t, overrides = {}) {
  const redis = {
    ping: async () => 'PONG', xadd: async () => '1-0', expire: async () => 1,
    disconnect() {}, duplicate() { return this; }, ...overrides,
  };
  t.mock.method(taskRedis, 'get', () => redis);
  return redis;
}

test('task creation verifies repository ID and URL and scopes the Job token to that repository', async t => {
  const user = { _id: id, githubId: '77', installationId: 555, installationStatus: 'active' };
  t.mock.method(UserModel, 'findById', () => ({ lean: async () => user }));
  fakeTaskRedis(t);
  const { accessToken } = issueTokens(user);
  const taskId = '607f1f77bcf86cd799439011';
  const repo = { id: 42, name: 'project', full_name: 'owner/project', private: true, html_url: 'https://github.com/owner/project', default_branch: 'main' };
  let scoped = false;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    if (url.endsWith('/access_tokens')) {
      if (options.body) {
        assert.deepEqual(JSON.parse(options.body), { repository_ids: [42], permissions: { contents: 'write', pull_requests: 'write' } });
        scoped = true;
      }
      return { ok: true, json: async () => ({ token: 'repo-only-token', expires_at: new Date(Date.now() + 3600000).toISOString() }) };
    }
    return { ok: true, json: async () => ({ repositories: [repo] }) };
  });
  const created = t.mock.method(Task, 'create', async input => {
    assert.equal(input.owner, id);
    assert.equal(input.repo.id, 42);
    return { toObject: () => ({ ...input, _id: taskId, status: 'pending', createdAt: new Date() }) };
  });
  const scheduled = t.mock.method(taskJobs, 'create', async (task, token) => {
    assert.equal(task._id, taskId);
    assert.equal(token, 'repo-only-token');
  });
  const wrong = await request(app).post('/api/v1/task').auth(accessToken, { type: 'bearer' })
    .send({ userInput: 'Add a page', repo: { id: 42, htmlUrl: 'https://github.com/another/project' } }).expect(403);
  assert.equal(wrong.body.success, false);
  assert.equal(created.mock.callCount(), 0);
  const response = await request(app).post('/api/v1/task').auth(accessToken, { type: 'bearer' })
    .send({ userInput: 'Add a page', owner: 'forged-owner', repo: { id: 42, htmlUrl: repo.html_url } }).expect(202);
  assert.equal(response.body.data.task.id, taskId);
  assert.equal('owner' in response.body.data.task, false);
  assert.equal('token' in response.body.data.task, false);
  assert.equal(scheduled.mock.callCount(), 1);
  assert.equal(scoped, true);
});

test('task Jobs share an ephemeral workspace, start clone first, and isolate credentials', () => {
  const job = buildTaskJob({
    _id: id, userInput: 'Build a page', repo: { htmlUrl: 'https://github.com/owner/project', fullName: 'owner/project', defaultBranch: 'main' },
  });
  const pod = job.spec.template.spec;
  assert.equal(pod.automountServiceAccountToken, false);
  assert.equal(job.spec.backoffLimit, 0);
  assert.equal(pod.initContainers[0].name, 'clone');
  assert.equal(pod.initContainers[1].restartPolicy, 'Always');
  assert.equal(pod.containers[0].name, 'agent');
  assert.equal(pod.containers[0].env.find(item => item.name === 'WORKSHOP_SERVER_URL').value, 'http://127.0.0.1:4000');
  assert.deepEqual(pod.initContainers[0].env.find(item => item.name === 'REDIS_URL').valueFrom.secretKeyRef,
    { name: job.metadata.name, key: 'redisUrl' });
  assert.equal(pod.initContainers[1].env.some(item => item.name.includes('TOKEN') || item.name.includes('KEY')), false);
  assert.equal(pod.volumes.find(item => item.name === 'workshop').emptyDir.sizeLimit, '2Gi');
  assert.equal(pod.containers[0].volumeMounts.find(item => item.name === 'task-metadata').readOnly, true);
});

test('reconciliation waits for a PR, persists its result before deletion, and logs failed pod cleanup', async t => {
  const task = { _id: id, status: 'in-progress', createdAt: new Date(), repo: { htmlUrl: 'https://github.com/owner/project' } };
  let completed = false;
  let terminal = { type: 'completed', pullRequestUrl: `${task.repo.htmlUrl}/pull/7` };
  let status = { active: 1 };
  const redis = fakeTaskRedis(t, { xrevrange: async () => [['2-0', ['event', JSON.stringify(terminal)]]] });
  t.mock.method(taskJobs, 'read', async () => ({ status }));
  const deleted = t.mock.method(taskJobs, 'delete', async () => assert.equal(completed, true));
  const updates = t.mock.method(Task, 'findByIdAndUpdate', (taskId, update) => {
    if (['completed', 'failed'].includes(update.$set.status)) completed = true;
    return { lean: async () => ({ ...task, ...update.$set }) };
  });
  await reconcileTask(task);
  assert.equal(deleted.mock.callCount(), 0);
  status = { conditions: [{ type: 'Complete', status: 'True' }] };
  await reconcileTask(task);
  assert.equal(deleted.mock.callCount(), 1);
  assert.equal(updates.mock.calls[0].arguments[1].$set.pullRequestUrl, terminal.pullRequestUrl);
  terminal = { type: 'started' };
  status = { conditions: [{ type: 'Failed', status: 'True' }] };
  const failureLog = t.mock.method(redis, 'xadd', async (...args) => {
    assert.equal(JSON.parse(args.at(-1)).type, 'failed');
  });
  await reconcileTask(task);
  assert.equal(failureLog.mock.callCount(), 1);
  assert.equal(deleted.mock.callCount(), 2);
});

test('SSE resumes from Last-Event-ID and drains remaining events before the terminal response', async t => {
  t.mock.method(UserModel, 'findById', () => ({ lean: async () => ({ _id: id }) }));
  t.mock.method(Task, 'findOne', () => ({
    lean: async () => ({ _id: id, status: 'completed', repo: {}, pullRequestUrl: 'https://github.com/owner/project/pull/1' }),
  }));
  fakeTaskRedis(t, {
    xread: async (...args) => {
      assert.equal(args.at(-1), '1-0');
      return [[`task:${id}`, [['2-0', ['event', '{"agent":"main","content":"working"}']]]]];
    },
    xrange: async () => [['3-0', ['event', '{"type":"completed","pullRequestUrl":"https://github.com/owner/project/pull/1"}']]],
  });
  const { accessToken } = issueTokens({ _id: id, githubId: '77' });
  const response = await request(app).get(`/api/v1/task/event/${id}`)
    .auth(accessToken, { type: 'bearer' }).set('Last-Event-ID', '1-0').expect(200);
  assert.match(response.headers['content-type'], /text\/event-stream/);
  assert.match(response.text, /id: 2-0/);
  assert.ok(response.text.indexOf('id: 3-0') < response.text.indexOf('event: done'));
  assert.equal(response.headers['x-accel-buffering'], 'no');
});

test('cookie mutations reject foreign origins and missing refresh tokens', async () => {
  const foreign = await request(app).post('/api/v1/auth/refresh').set('Origin', 'https://other.example').expect(403);
  assert.deepEqual(foreign.body.errors, []);
  await request(app).post('/api/v1/auth/refresh').set('Origin', env.frontendOrigin).expect(401);
});

test('GitHub login redirects with browser-bound httpOnly Lax state', async () => {
  const response = await request(app).get('/api/v1/auth/github').expect(302);
  const url = new URL(response.headers.location);
  assert.equal(url.origin, 'https://github.com');
  assert.equal(url.searchParams.get('redirect_uri'), `${env.frontendOrigin}/api/v1/auth/github/callback`);
  assert.equal(url.searchParams.get('state').length, 64);
  const cookie = response.headers['set-cookie'][0];
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Lax/);
  assert.match(cookie, /Path=\/api\/v1\/auth/);
});

test('OAuth and installation callbacks reject missing, mismatched and malformed state', async () => {
  await request(app).get('/api/v1/auth/github/callback?code=forged&state=forged').expect(401);
  const context = signContext({ nonce: 'a'.repeat(64) }, 'oauth');
  const mismatch = await request(app).get('/api/v1/auth/github/callback?code=forged&state=wrong')
    .set('Cookie', `oauthContext=${context}`).expect(401);
  assert.equal(mismatch.body.message, 'Invalid or expired OAuth state');
  const unicode = await request(app).get(`/api/v1/auth/github/callback?code=x&state=${encodeURIComponent('é'.repeat(64))}`)
    .set('Cookie', `oauthContext=${context}`).expect(401);
  assert.deepEqual(unicode.body.errors, []);
  const invalid = await request(app).get('/api/v1/auth/github/install/callback?installation_id=bad&state=x').expect(422);
  assert.ok(invalid.body.errors.some(error => error.field === 'installation_id'));
});

test('webhook route rejects unsigned payloads before database writes', async () => {
  const response = await request(app).post('/api/v1/webhook/github/event').send({ action: 'opened' }).expect(401);
  assert.equal(response.body.message, 'Invalid webhook signature');
});

test('centralized errors normalize duplicate keys, casts, expired tokens and unknown failures', () => {
  function render(error) {
    let status;
    let body;
    const res = { status(value) { status = value; return this; }, json(value) { body = value; } };
    errorMiddleware(error, {}, res, () => {});
    return { status, body };
  }
  assert.equal(render(Object.assign(new Error(), { code: 11000, keyPattern: { githubId: 1 } })).status, 409);
  assert.deepEqual(render(Object.assign(new Error(), { name: 'CastError', path: 'id' })).body.errors, [{ field: 'id', message: 'Invalid value' }]);
  assert.equal(render(Object.assign(new Error(), { name: 'TokenExpiredError' })).status, 401);
  const log = mock.method(console, 'error', () => {});
  const unknown = render(new Error('private database details'));
  assert.equal(unknown.status, 500);
  assert.equal(unknown.body.message, 'Internal server error');
  assert.equal(log.mock.callCount(), 1);
  log.mock.restore();
  assert.equal(render(new AppError(422, 'Validation failed', [{ field: 'state', message: 'Invalid' }])).body.errors.length, 1);
});

test('refresh rotates atomically, rejects replay and logout revokes the stored token', integration, async () => {
  const user = await users.createUser({ githubId: 'rotation-user', username: 'rotator', name: 'Rotator', avatarUrl: 'https://example.com/avatar' });
  const tokens = issueTokens(user);
  await users.updateRefreshToken(user._id, hashToken(tokens.refreshToken));
  const response = await request(app).post('/api/v1/auth/refresh').set('Cookie', `refreshToken=${tokens.refreshToken}`).expect(200);
  assert.equal(response.body.data.user.username, 'rotator');
  assert.equal('refreshToken' in response.body.data, false);
  assert.equal('refreshToken' in response.body.data.user, false);
  assert.equal('password' in response.body.data.user, false);
  const cookie = response.headers['set-cookie'][0];
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Strict/);
  assert.match(cookie, /Max-Age=604800/);
  await request(app).post('/api/v1/auth/refresh').set('Cookie', `refreshToken=${tokens.refreshToken}`).expect(401);
  const currentCookie = cookie.split(';')[0];
  const current = decodeURIComponent(currentCookie.slice('refreshToken='.length));
  const stored = await users.findUserByIdWithRefreshToken(user._id);
  assert.equal(stored.refreshToken, hashToken(current));
  assert.notEqual(stored.refreshToken, current);
  const profile = await request(app).get('/api/v1/auth/me').auth(response.body.data.accessToken, { type: 'bearer' }).expect(200);
  assert.equal(profile.body.data.user.githubId, 'rotation-user');
  const logout = await request(app).post('/api/v1/auth/logout').auth(response.body.data.accessToken, { type: 'bearer' }).set('Cookie', currentCookie).expect(200);
  assert.deepEqual(logout.body.data, {});
  assert.match(logout.headers['set-cookie'][0], /Expires=Thu, 01 Jan 1970/);
  await request(app).post('/api/v1/auth/refresh').set('Cookie', currentCookie).expect(401);
});

test('simultaneous refresh requests cannot both rotate one token', integration, async () => {
  const user = await users.findUserByGithubId('rotation-user');
  const tokens = issueTokens(user);
  await users.updateRefreshToken(user._id, hashToken(tokens.refreshToken));
  const responses = await Promise.all([1, 2].map(() =>
    request(app).post('/api/v1/auth/refresh').set('Cookie', `refreshToken=${tokens.refreshToken}`)));
  assert.deepEqual(responses.map(res => res.status).sort(), [200, 401]);
});

function signedDelivery(payload, event = 'push', deliveryId = randomUUID()) {
  const body = JSON.stringify(payload);
  return request(app).post('/api/v1/webhook/github/event')
    .set('Content-Type', 'application/json')
    .set('X-GitHub-Delivery', deliveryId)
    .set('X-GitHub-Event', event)
    .set('X-Hub-Signature-256', `sha256=${createHmac('sha256', env.githubWebhookSecret).update(body).digest('hex')}`)
    .send(body);
}

test('signed deliveries are idempotent, private summaries are scoped, and lifecycle changes persist', integration, async () => {
  const user = await users.findUserByGithubId('rotation-user');
  await users.updateInstallation(user._id, { installationId: 555, installationStatus: 'active', installationAccount: 'rotator' });
  const payload = { installation: { id: 555 }, sender: { login: 'rotator' }, repository: { full_name: 'rotator/project' }, sensitive_code: 'not persisted' };
  const deliveryId = randomUUID();
  await signedDelivery(payload, 'push', deliveryId).expect(200);
  await signedDelivery(payload, 'push', deliveryId).expect(200);
  await signedDelivery({ installation: { id: 999 } }).expect(200);
  const stored = await events.listEvents(555);
  assert.equal(stored.length, 1);
  assert.equal('sensitive_code' in stored[0], false);
  const { accessToken } = issueTokens(user);
  const response = await request(app).get('/api/v1/activity').auth(accessToken, { type: 'bearer' }).expect(200);
  assert.equal(response.body.data.events.length, 1);
  assert.equal(response.body.data.events[0].installationId, 555);
  await signedDelivery({ action: 'deleted', installation: { id: 555, app_id: 12345 } }, 'installation').expect(200);
  assert.equal((await users.findUserById(user._id)).installationStatus, 'removed');
  const removed = await request(app).get('/api/v1/activity').auth(accessToken, { type: 'bearer' }).expect(200);
  assert.deepEqual(removed.body.data.events, []);
});

test('complete OAuth registration installs app and re-verifies ownership without storing GitHub tokens', integration, async () => {
  const strategy = passport._strategy('github');
  const tokenMock = mock.method(strategy._oauth2, 'getOAuthAccessToken', (code, options, done) => done(null, 'github-user-token', null, {}));
  const profileMock = mock.method(strategy, 'userProfile', (token, done) => done(null, { id: 'oauth-account', username: 'octocat', displayName: 'Octocat' }));
  let installations = [];
  const fetchMock = mock.method(globalThis, 'fetch', async () => ({
    ok: true, json: async () => ({ installations }),
  }));
  try {
    const nonce = 'c'.repeat(64);
    const context = signContext({ nonce }, 'oauth');
    const registered = await request(app).get(`/api/v1/auth/github/callback?code=valid&state=${nonce}`)
      .set('Cookie', `oauthContext=${context}`).expect(302);
    assert.match(registered.headers.location, /^https:\/\/github.com\/apps\/exlantern\/installations\/new\?state=/);
    const user = await users.findUserByGithubId('oauth-account');
    assert.equal(user.installationStatus, 'pending');
    assert.equal('accessToken' in user, false);
    const installState = new URL(registered.headers.location).searchParams.get('state');
    const installCookie = registered.headers['set-cookie'].find(cookie => cookie.startsWith('installationContext=')).split(';')[0];
    const setup = await request(app).get(`/api/v1/auth/github/install/callback?installation_id=777&state=${installState}`)
      .set('Cookie', installCookie).expect(302);
    assert.match(setup.headers.location, /^https:\/\/github.com\/login\/oauth\/authorize/);
    const verifyState = new URL(setup.headers.location).searchParams.get('state');
    const oauthCookie = setup.headers['set-cookie'].find(cookie => cookie.startsWith('oauthContext=')).split(';')[0];
    installations = [{ id: 777, app_id: 12345, account: { login: 'octocat' }, suspended_at: null }];
    const verified = await request(app).get(`/api/v1/auth/github/callback?code=verify&state=${verifyState}`)
      .set('Cookie', oauthCookie).expect(302);
    assert.equal(verified.headers.location, `${env.frontendOrigin}/auth/callback`);
    assert.equal((await users.findUserById(user._id)).installationId, 777);
    assert.ok(fetchMock.mock.callCount() >= 2);

    installations = [{ id: 888, app_id: 98765, account: { login: 'octocat' } }];
    const forgedContext = signContext({ nonce, id: String(user._id), installationId: 888 }, 'oauth');
    const rejected = await request(app).get(`/api/v1/auth/github/callback?code=wrong-app&state=${nonce}`)
      .set('Cookie', `oauthContext=${forgedContext}`).expect(403);
    assert.equal(rejected.body.message, 'GitHub installation access could not be verified');
    assert.equal((await users.findUserById(user._id)).installationId, 777);
  } finally {
    tokenMock.mock.restore();
    profileMock.mock.restore();
    fetchMock.mock.restore();
  }
});
