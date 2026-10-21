import app from './app.js';
import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';

try {
    await connectDatabase();
    await new Promise((resolve, reject) => {
        const server = app.listen(env.port, () => resolve(server));
        server.once('error', reject);
    });
    console.log(`Authentication API listening on port ${env.port}`);
} catch (error) {
    console.error('Unable to start the authentication API', error);
    process.exitCode = 1;
}