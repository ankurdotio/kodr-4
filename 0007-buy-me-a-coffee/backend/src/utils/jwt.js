import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

/** @typedef {{ id: string, email: string }} TokenPayload */

/**
 * Signs a 15-minute access token.
 * @param {TokenPayload} payload
 * @returns {string}
 */
export function signAccessToken(payload) {
  return jwt.sign({ id: payload.id, email: payload.email }, env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
}

/**
 * Signs a 7-day refresh token.
 * @param {TokenPayload} payload
 * @returns {string}
 */
export function signRefreshToken(payload) {
  return jwt.sign({ id: payload.id, email: payload.email }, env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
}

/**
 * Verifies an access token.
 * @param {string} token
 * @returns {TokenPayload}
 * @throws {jwt.JsonWebTokenError | jwt.TokenExpiredError}
 */
export function verifyAccessToken(token) {
  return /** @type {TokenPayload} */ (jwt.verify(token, env.ACCESS_TOKEN_SECRET));
}

/**
 * Verifies a refresh token.
 * @param {string} token
 * @returns {TokenPayload}
 * @throws {jwt.JsonWebTokenError | jwt.TokenExpiredError}
 */
export function verifyRefreshToken(token) {
  return /** @type {TokenPayload} */ (jwt.verify(token, env.REFRESH_TOKEN_SECRET));
}
