import 'dotenv/config';

/** Validate configuration before the server starts.
 * @param {NodeJS.ProcessEnv} source Environment variables.
 * @returns {Readonly<object>} Validated immutable configuration.
 * @throws {Error} If configuration is missing or unsafe.
 */
export function readEnv(source) {
  const required = ['MONGODB_URI', 'GITHUB_CLIENT_ID', 'GITHUB_APP_ID',
    'GITHUB_CLIENT_SECRET', 'GITHUB_WEBHOOK_SECRET', 'GITHUB_APP_SLUG',
    'ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET'];
  for (const key of required) {
    if (!source[key]?.trim() || source[key].startsWith('replace-with')) {
      throw new Error(`Set a real value for ${key}`);
    }
  }
  const nodeEnv = source.NODE_ENV || 'development';
  const port = Number(source.PORT || 3000);
  const origin = new URL(source.FRONTEND_ORIGIN || 'http://localhost:5173');
  if (!['development', 'test', 'production'].includes(nodeEnv)) throw new Error('Invalid NODE_ENV');
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT');
  if (!/^[1-9]\d*$/.test(source.GITHUB_APP_ID)) throw new Error('GITHUB_APP_ID must be numeric');
  if (!/^[a-z0-9-]+$/.test(source.GITHUB_APP_SLUG)) throw new Error('Invalid GITHUB_APP_SLUG');
  if (!/^mongodb(\+srv)?:\/\//.test(source.MONGODB_URI)) throw new Error('Invalid MONGODB_URI');
  if (!['http:', 'https:'].includes(origin.protocol) || origin.origin !== origin.href.replace(/\/$/, '')) {
    throw new Error('FRONTEND_ORIGIN must be an HTTP(S) origin without a path');
  }
  if (nodeEnv === 'production' && origin.protocol !== 'https:') throw new Error('Production requires HTTPS');
  for (const key of ['ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET']) {
    if (source[key].length < 32) throw new Error(`${key} must have at least 32 characters`);
  }
  if (source.ACCESS_TOKEN_SECRET === source.REFRESH_TOKEN_SECRET) throw new Error('Token secrets must differ');
  return Object.freeze({
    nodeEnv, port, frontendOrigin: origin.origin,
    mongoUri: source.MONGODB_URI,
    githubClientId: source.GITHUB_CLIENT_ID,
    githubAppId: source.GITHUB_APP_ID,
    githubClientSecret: source.GITHUB_CLIENT_SECRET,
    githubWebhookSecret: source.GITHUB_WEBHOOK_SECRET,
    githubAppSlug: source.GITHUB_APP_SLUG,
    githubAppPrivateKey: Buffer.from(source.GITHUB_APP_PRIVATE_KEY,"base64").toString('utf-8'),
    accessTokenSecret: source.ACCESS_TOKEN_SECRET,
    refreshTokenSecret: source.REFRESH_TOKEN_SECRET,
  });
}

export const env = readEnv(process.env);
