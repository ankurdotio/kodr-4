import app from './app.js';

const port = Number(process.env.PORT ?? 3000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
}

const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});

server.on('error', (error) => {
    console.error('Server failed:', error);
    process.exitCode = 1;
});

for (const signal of ['SIGTERM', 'SIGINT']) {
    process.on(signal, () => {
        console.log(`${signal} received; closing server`);
        server.close((error) => {
            if (error) {
                console.error('Failed to close server:', error);
                process.exitCode = 1;
            }
        });
    });
}
