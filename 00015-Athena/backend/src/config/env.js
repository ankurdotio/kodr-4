import 'dotenv/config';

const requiredSecrets = [ 'ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET' ];

for (const secretName of requiredSecrets) {
    if (!process.env[ secretName ] || process.env[ secretName ].length < 32) {
        throw new Error(`${secretName} must be set to at least 32 characters`);
    }
}

if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be set');
}

/** @type {Readonly<{mongoUri: string, port: number, nodeEnv: string, accessTokenSecret: string, refreshTokenSecret: string}>} */
export const env = Object.freeze({
    mongoUri: process.env.MONGO_URI,
    port: Number.parseInt(process.env.PORT ?? '5001', 10),
    nodeEnv: process.env.NODE_ENV ?? 'development',
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
});