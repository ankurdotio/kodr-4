import { createHash } from 'node:crypto';
import SessionModel from '../models/session.model.js';

function hashToken(refreshToken) {
    return createHash('sha256').update(refreshToken).digest('hex');
}

/** Create a session while persisting only the SHA-256 token hash.
 * @param {{userId: import('mongoose').Types.ObjectId | string, refreshToken: string, userAgent?: string}} sessionData
 * @returns {Promise<import('mongoose').HydratedDocument<unknown>>}
 */
export async function createSession(sessionData) {
    return SessionModel.create({
        userId: sessionData.userId,
        tokenHash: hashToken(sessionData.refreshToken),
        userAgent: sessionData.userAgent ?? '',
    });
}

/** Find a session by hashing the presented refresh token.
 * @param {string} refreshToken
 * @returns {Promise<import('mongoose').HydratedDocument<unknown> | null>}
 */
export async function findSessionByToken(refreshToken) {
    return SessionModel.findOne({ tokenHash: hashToken(refreshToken) }).exec();
}

/** Atomically consume a refresh session and link its replacement.
 * @param {string} sessionId
 * @param {string} replacementSessionId
 * @returns {Promise<boolean>}
 */
export async function rotateSession(sessionId, replacementSessionId) {
    const result = await SessionModel.updateOne(
        { _id: sessionId, revokedAt: null, expiresAt: { $gt: new Date() } },
        { $set: { revokedAt: new Date(), replacedBy: replacementSessionId } },
    ).exec();
    return result.modifiedCount === 1;
}

/** Revoke every active session for an account after detected token reuse.
 * @param {string} userId
 * @returns {Promise<import('mongoose').UpdateWriteOpResult>}
 */
export async function revokeUserSessions(userId) {
    return SessionModel.updateMany(
        { userId, revokedAt: null },
        { $set: { revokedAt: new Date() } },
    ).exec();
}

/** Revoke one active session by its identifier.
 * @param {string} sessionId
 * @returns {Promise<import('mongoose').UpdateWriteOpResult>}
 */
export async function revokeSession(sessionId) {
    return SessionModel.updateOne(
        { _id: sessionId, revokedAt: null },
        { $set: { revokedAt: new Date() } },
    ).exec();
}

/** Delete an unused replacement after a concurrent rotation loses its compare-and-set.
 * @param {string} sessionId
 * @returns {Promise<import('mongoose').DeleteResult>}
 */
export async function deleteSession(sessionId) {
    return SessionModel.deleteOne({ _id: sessionId }).exec();
}