import jwt from "jsonwebtoken"
import config from "../config/config.js"


/**
 * @description Generates access and refresh tokens for a given user ID.
 * @param {string} userId - The ID of the user for whom to generate tokens.
 * @returns {Object} An object containing the generated access and refresh tokens.
 */
export function generateTokens(userId) {

    const accessToken = jwt.sign({ userId }, config.ACCESS_TOKEN_SECRET, { expiresIn: "15m" })
    const refreshToken = jwt.sign({ userId }, config.REFRESH_TOKEN_SECRET, { expiresIn: "7d" })

    return {
        accessToken,
        refreshToken
    }
}


/**
 * @description Verifies the validity of a given refresh token.
 * @param {string} refreshToken - The refresh token to verify.
 * @returns {Object} The decoded payload if the token is valid, otherwise throws an error.
 */
export function verifyRefreshToken(refreshToken) {
    return jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET)
}


/**
 * @description Verifies the validity of a given access token.
 * @param {string} accessToken - The access token to verify.
 * @returns {Object} The decoded payload if the token is valid, otherwise throws an error.
 */
export function verifyAccessToken(accessToken) {
    return jwt.verify(accessToken, config.ACCESS_TOKEN_SECRET)
}
