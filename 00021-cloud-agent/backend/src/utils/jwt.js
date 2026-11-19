import { createHash, randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from './AppError.js';

const issuer = 'cloud-agent';

/** Issue uniquely identified access and refresh tokens.
 * @param {object} user Persisted user.
 * @returns {import('../types/user.js').TokenPair} JWT pair.
 */
export function issueTokens(user) {
  const payload = { id: String(user._id), githubId: user.githubId };
  return {
    accessToken: jwt.sign(payload, env.accessTokenSecret, {
      algorithm: 'HS256', expiresIn: '15m', issuer, audience: 'access', jwtid: randomUUID(),
    }),
    refreshToken: jwt.sign(payload, env.refreshTokenSecret, {
      algorithm: 'HS256', expiresIn: '7d', issuer, audience: 'refresh', jwtid: randomUUID(),
    }),
  };
}

/** Verify a JWT's signature, purpose, and identifier.
 * @param {string} token JWT.
 * @param {'access'|'refresh'|'oauth'|'installation'} purpose Expected audience.
 * @returns {object} Verified claims.
 * @throws {Error} If verification fails.
 */
export function verifyToken(token, purpose) {
  const secret = purpose === 'access' ? env.accessTokenSecret : env.refreshTokenSecret;
  const payload = jwt.verify(token, secret, { algorithms: ['HS256'], issuer, audience: purpose });
  if (typeof payload !== 'object' || (['access', 'refresh'].includes(purpose) &&
      !/^[a-f\d]{24}$/i.test(payload.id || ''))) throw new AppError(401, 'Invalid authentication token');
  return payload;
}

/** Sign short-lived browser-bound OAuth context.
 * @param {object} data Context without credentials.
 * @param {'oauth'|'installation'} purpose Expected use.
 * @returns {string} Ten-minute signed token.
 */
export function signContext(data, purpose) {
  return jwt.sign(data, env.refreshTokenSecret, {
    algorithm: 'HS256', expiresIn: '10m', issuer, audience: purpose, jwtid: randomUUID(),
  });
}

/** Hash refresh tokens before storage.
 * @param {string} token Refresh JWT.
 * @returns {string} SHA-256 hex hash.
 */
export function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}
