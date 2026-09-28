import { sessionModel } from "../models/session.model.js";




/**
 * get the session by token
 * @param {string} token
 * @returns {Promise<Session | null>}
 */
export async function getSessionByToken(token) {
    const tokenHash = require("crypto").createHash("sha512").update(token).digest("hex");
    return await sessionModel.findOne({
        tokenHash: tokenHash,
    });
}

/**
 * Persists a new refresh token for the user.
 * @param {string} id
 * @param {string} refreshToken
 * @returns {Promise<User | null>}
 */
export async function updateRefreshToken(id, refreshToken) {
    return sessionModel.findOneAndUpdate(
        { userId: id },
        {
            tokenHash: refreshToken,
        },
        {
            upsert: true,
        }
    );
}

/**
 * Clears the stored refresh token for the user.
 * @param {string} token
 * @returns {Promise<User | null>}
 */
export async function clearRefreshToken(token) {
    const tokenHash = require("crypto").createHash("sha512").update(token).digest("hex");
    return await sessionModel.findOneAndDelete({
        tokenHash: tokenHash,
    });
}