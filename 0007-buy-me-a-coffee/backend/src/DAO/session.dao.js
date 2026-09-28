import { sessionModel } from "../models/session.model.js";



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