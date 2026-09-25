import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

/**
 * Signs a short-lived access token.
 * @param {{id: string, email: string}} payload
 * @returns {string} The signed JWT access token, expiring in 15 minutes.
 */
export function signAccessToken(payload) {
    return jwt.sign(payload, env.accessTokenSecret, { expiresIn: "15m" });
}

/**
 * Signs a long-lived refresh token.
 * @param {{id: string, email: string}} payload
 * @returns {string} The signed JWT refresh token, expiring in 7 days.
 */
export function signRefreshToken(payload) {
    return jwt.sign(payload, env.refreshTokenSecret, { expiresIn: "7d" });
}

/**
 * Verifies an access token.
 * @param {string} token
 * @returns {{id: string, email: string}} The decoded token payload.
 * @throws {Error} If the token is invalid or expired.
 */
export function verifyAccessToken(token) {
    return jwt.verify(token, env.accessTokenSecret);
}

/**
 * Verifies a refresh token.
 * @param {string} token
 * @returns {{id: string, email: string}} The decoded token payload.
 * @throws {Error} If the token is invalid or expired.
 */
export function verifyRefreshToken(token) {
    return jwt.verify(token, env.refreshTokenSecret);
}
