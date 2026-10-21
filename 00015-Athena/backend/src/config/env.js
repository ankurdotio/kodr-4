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

const bedrockDefaultModel = process.env.BEDROCK_DEFAULT_MODEL ?? 'anthropic.claude-3-5-sonnet-20241022-v2:0';
const bedrockModelAllowList = (process.env.BEDROCK_MODEL_ALLOW_LIST ?? bedrockDefaultModel)
    .split(',')
    .map((modelId) => modelId.trim())
    .filter(Boolean);
const refreshTokenTtl = Number.parseInt(process.env.REFRESH_TOKEN_TTL ?? '604800', 10);

if (!bedrockModelAllowList.includes(bedrockDefaultModel)) {
    throw new Error('BEDROCK_DEFAULT_MODEL must be included in BEDROCK_MODEL_ALLOW_LIST');
}

if (!Number.isSafeInteger(refreshTokenTtl) || refreshTokenTtl <= 0) {
    throw new Error('REFRESH_TOKEN_TTL must be a positive integer number of seconds');
}

/**
 *  @type {Readonly<{mongoUri: string, port: number, nodeEnv: string, accessTokenSecret: string, refreshTokenSecret: string, refreshTokenTtl: number, bedrockDefaultModel: string, bedrockModelAllowList: string[],TITLE_GENERATION_MODEL: string, AWS_REGION: string, AWS_ACCESS_KEY_ID: string, AWS_SECRET_ACCESS_KEY: string}>}
 */
export const env = Object.freeze({
    mongoUri: process.env.MONGO_URI,
    port: Number.parseInt(process.env.PORT ?? '5001', 10),
    nodeEnv: process.env.NODE_ENV ?? 'development',
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
    refreshTokenTtl,
    bedrockDefaultModel,
    bedrockModelAllowList: Object.freeze(bedrockModelAllowList),
    TITLE_GENERATION_MODEL: process.env.TITLE_GENERATION_MODEL ?? 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    AWS_REGION: process.env.AWS_REGION ?? 'us-east-1',
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
});