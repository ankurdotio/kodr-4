import assert from 'node:assert/strict';
import { once } from 'node:events';
import { after, before, test } from 'node:test';
import app from './app.js';

let server;
let baseUrl;

before(async () => {
    server = app.listen(0, '127.0.0.1');
    await once(server, 'listening');
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
    });
});

test('serves the greeting, health check, and dummy data', async () => {
    const cases = [
        ['/', { message: 'Hello from Express on Kubernetes!' }],
        ['/health', { status: 'ok' }],
        ['/api/users', { data: [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
            { id: 3, name: 'Charlie' }
        ] }],
        ['/api/users/1', { data: { id: 1, name: 'Alice' } }],
        ['/api/products', { data: [
            { id: 1, name: 'Keyboard', price: 49 },
            { id: 2, name: 'Mouse', price: 25 }
        ] }]
    ];

    for (const [path, expected] of cases) {
        const response = await fetch(`${baseUrl}${path}`);
        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), expected);
    }
});

test('returns JSON errors for missing users and routes', async () => {
    for (const path of ['/api/users/999', '/api/users/01', '/missing']) {
        const response = await fetch(`${baseUrl}${path}`);
        assert.equal(response.status, 404);
        assert.equal(typeof (await response.json()).message, 'string');
    }
});

test('echoes JSON without storing it', async () => {
    const body = { message: 'Hello Kubernetes', count: 2 };
    const response = await fetch(`${baseUrl}/api/echo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { data: body });
});

test('rejects missing, malformed, and oversized JSON bodies', async () => {
    const cases = [
        [undefined, 400, 'A JSON body is required'],
        ['{invalid', 400, 'Invalid JSON body'],
        [JSON.stringify({ message: 'x'.repeat(11000) }), 413, 'JSON body is too large']
    ];

    for (const [body, status, message] of cases) {
        const response = await fetch(`${baseUrl}/api/echo`, {
            method: 'POST',
            headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
            body
        });
        assert.equal(response.status, status);
        assert.deepEqual(await response.json(), { message });
    }
});
