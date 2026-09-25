import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";

/** Connects to MongoDB, then starts the HTTP server. */
async function start() {
    await connectDB();
    app.listen(env.port, () => {
        console.log(`Server listening on port ${env.port}`);
    });
}

start().catch((err) => {
    console.error("Failed to start server", err);
    process.exit(1);
});
