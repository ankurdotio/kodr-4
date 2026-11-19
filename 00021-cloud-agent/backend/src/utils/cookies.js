import { env } from '../config/env.js';

export const cookieOptions = Object.freeze({
  httpOnly: true, secure: env.nodeEnv === 'production', sameSite: 'strict', path: '/api/v1/auth',
});
// GitHub redirects are cross-site top-level navigations; OAuth state cookies need Lax.
export const contextCookieOptions = Object.freeze({ ...cookieOptions, sameSite: 'lax', maxAge: 600000 });

/** Set the refresh cookie without exposing it to JavaScript.
 * @param {import('express').Response} res Response.
 * @param {string} token Refresh token.
 * @returns {void}
 */
export function setRefreshCookie(res, token) {
  res.cookie('refreshToken', token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
}
