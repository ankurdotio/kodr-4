import { randomBytes, timingSafeEqual } from 'node:crypto';
import { passport } from '../config/passport.js';
import { env } from '../config/env.js';
import * as users from '../DAO/user.dao.js';
import { findGithubInstallation } from '../services/github.service.js';
import { AppError } from '../utils/AppError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { hashToken, issueTokens, signContext, verifyToken } from '../utils/jwt.js';
import { cookieOptions, contextCookieOptions, setRefreshCookie } from '../utils/cookies.js';

/** Map a persisted record to safe public fields.
 * @param {object} user User record.
 * @returns {import('../types/user.js').PublicUser} Safe response.
 */
export function toPublicUser(user) {
  return {
    id: String(user._id), githubId: user.githubId, username: user.username,
    name: user.name, avatarUrl: user.avatarUrl, installationId: user.installationId,
    installationStatus: user.installationStatus, installationAccount: user.installationAccount,
    createdAt: user.createdAt,
  };
}

function assertState(actual, expected) {
  if (typeof actual !== 'string' || typeof expected !== 'string' ||
      Buffer.byteLength(actual) !== Buffer.byteLength(expected) ||
      !timingSafeEqual(Buffer.from(actual), Buffer.from(expected))) {
    throw new AppError(401, 'Invalid or expired OAuth state');
  }
}

function startOAuth(req, res, next, extra = {}) {
  const nonce = randomBytes(32).toString('hex');
  res.cookie('oauthContext', signContext({ nonce, ...extra }, 'oauth'), contextCookieOptions);
  passport.authenticate('github', { session: false, state: nonce })(req, res, next);
}

function installationUrl(res, user) {
  const nonce = randomBytes(32).toString('hex');
  res.cookie('installationContext', signContext({ id: String(user._id), nonce }, 'installation'), contextCookieOptions);
  const url = new URL(`https://github.com/apps/${env.githubAppSlug}/installations/new`);
  url.searchParams.set('state', nonce);
  return url.href;
}

/** Start the shared GitHub registration/login flow.
 * @param {import('express').Request} req Request.
 * @param {import('express').Response} res Response.
 * @param {import('express').NextFunction} next Error continuation.
 * @returns {void}
 */
export function githubLogin(req, res, next) {
  startOAuth(req, res, next);
}

/** Exchange the OAuth code, resolve an identity, and verify app installation.
 * @param {import('express').Request} req OAuth callback.
 * @param {import('express').Response} res Response.
 * @param {import('express').NextFunction} next Error continuation.
 * @returns {void}
 * @throws {AppError} If OAuth state or installation access fails.
 */
export function githubCallback(req, res, next) {
  const context = verifyToken(req.cookies.oauthContext || '', 'oauth');
  assertState(req.query.state, context.nonce);
  res.clearCookie('oauthContext', cookieOptions);
  if (req.query.error) throw new AppError(401, 'GitHub authorization was not completed');
  passport.authenticate('github', { session: false }, (err, identity) => {
    if (err) { next(err); return; }
    if (!identity) { next(new AppError(401, 'GitHub authentication failed')); return; }
    finishGithubLogin(identity, context, res).catch(next);
  })(req, res, next);
}

async function finishGithubLogin({ profile, accessToken }, context, res) {
  if (!profile.id || !profile.username) throw new AppError(502, 'GitHub returned an incomplete profile');
  let user = await users.findUserByGithubId(profile.id);
  if (!user) {
    try {
      user = await users.createUser({
        githubId: profile.id, username: profile.username,
        name: profile.displayName || profile.username,
        avatarUrl: `https://avatars.githubusercontent.com/u/${encodeURIComponent(profile.id)}`,
      });
    } catch (error) {
      if (error.code !== 11000) throw error;
      user = await users.findUserByGithubId(profile.id);
      if (!user) throw error;
    }
  }
  if (context.id && context.id !== String(user._id)) {
    throw new AppError(403, 'Complete installation with the same GitHub account');
  }
  const installation = await findGithubInstallation(accessToken, context.installationId);
  if (context.installationId && !installation) throw new AppError(403, 'GitHub installation access could not be verified');
  if (installation) {
    user = await users.updateInstallation(user._id, {
      installationId: installation.id,
      installationStatus: installation.suspended_at ? 'suspended' : 'active',
      installationAccount: installation.account.login,
    });
  } else {
    user = await users.updateInstallation(user._id, {
      installationId: null, installationStatus: 'pending', installationAccount: '',
    });
  }
  const tokens = issueTokens(user);
  await users.updateRefreshToken(user._id, hashToken(tokens.refreshToken));
  setRefreshCookie(res, tokens.refreshToken);
  res.set('Cache-Control', 'no-store');
  if (!installation) { res.redirect(installationUrl(res, user)); return; }
  res.redirect(`${env.frontendOrigin}/auth/callback`);
}

/** Validate browser-bound installation state and reauthorize to verify access.
 * @param {import('express').Request} req Installation callback.
 * @param {import('express').Response} res Response.
 * @param {import('express').NextFunction} next Error continuation.
 * @returns {void}
 * @throws {AppError} If installation state is invalid.
 */
export function installationCallback(req, res, next) {
  const context = verifyToken(req.cookies.installationContext || '', 'installation');
  assertState(req.query.state, context.nonce);
  res.clearCookie('installationContext', cookieOptions);
  startOAuth(req, res, next, { id: context.id, installationId: Number(req.query.installation_id) });
}

/** Start app connection for an authenticated account.
 * @param {import('express').Request} req Authenticated request.
 * @param {import('express').Response} res Response.
 * @returns {import('express').Response} Installation URL.
 */
export async function connectGithub(req, res) {
  return sendSuccess(res, 200, 'GitHub installation URL created', { url: installationUrl(res, req.user) });
}

/** Atomically rotate a persisted refresh token.
 * @param {import('express').Request} req Cookie request.
 * @param {import('express').Response} res Response.
 * @returns {Promise<import('express').Response>} New access token and public user.
 * @throws {AppError} If a token is absent, revoked, or replayed.
 */
export async function refresh(req, res) {
  const token = req.cookies.refreshToken;
  if (!token) throw new AppError(401, 'Authentication required');
  const claims = verifyToken(token, 'refresh');
  const user = await users.findUserByIdWithRefreshToken(claims.id);
  if (!user || user.refreshToken !== hashToken(token)) throw new AppError(401, 'Session expired; sign in again');
  const tokens = issueTokens(user);
  const updated = await users.updateRefreshToken(user._id, hashToken(tokens.refreshToken), hashToken(token));
  if (!updated) throw new AppError(401, 'Session expired; sign in again');
  setRefreshCookie(res, tokens.refreshToken);
  res.set('Cache-Control', 'no-store');
  return sendSuccess(res, 200, 'Session refreshed', {
    accessToken: tokens.accessToken, user: toPublicUser(updated), githubAppSlug: env.githubAppSlug,
  });
}

/** Revoke the current refresh token and clear its cookie.
 * @param {import('express').Request} req Request.
 * @param {import('express').Response} res Response.
 * @returns {Promise<import('express').Response>} Logout confirmation.
 */
export async function logout(req, res) {
  const token = req.cookies.refreshToken;
  if (token) {
    const user = req.user;
    await users.clearRefreshToken(user._id, hashToken(token));
  }
  res.clearCookie('refreshToken', cookieOptions);
  return sendSuccess(res, 200, 'Logged out successfully', {});
}

/** Return the authenticated public profile.
 * @param {import('express').Request} req Authenticated request.
 * @param {import('express').Response} res Response.
 * @returns {import('express').Response} Public user and app metadata.
 */
export function me(req, res) {
  res.set('Cache-Control', 'no-store');
  return sendSuccess(res, 200, 'Profile retrieved', {
    user: toPublicUser(req.user), githubAppSlug: env.githubAppSlug,
  });
}
