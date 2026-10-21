import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/** Issue a short-lived bearer access token.
 * @param {{id: string, email: string}} user
 * @returns {string}
 */
export function createAccessToken(user) {
    return jwt.sign({ id: user.id, email: user.email }, env.accessTokenSecret, {
        expiresIn: '15m',
        jwtid: randomUUID(),
    });
}

/** Issue a refresh token signed with its independent secret.
 * @param {{id: string, email: string}} user
 * @returns {string}
 */
export function createRefreshToken(user) {
    return jwt.sign({ id: user.id, email: user.email }, env.refreshTokenSecret, {
        expiresIn: '7d',
        jwtid: randomUUID(),
    });
}

/** Verify a bearer access token.
 * @param {string} token
 * @returns {{id: string, email: string}}
 */
export function verifyAccessToken(token) {
    return /** @type {{id: string, email: string}} */ (jwt.verify(token, env.accessTokenSecret));
}

/** Verify a refresh token.
 * @param {string} token
 * @returns {{id: string, email: string}}
 */
export function verifyRefreshToken(token) {
    return /** @type {{id: string, email: string}} */ (jwt.verify(token, env.refreshTokenSecret));
}