import { findUserById } from '../DAO/user.dao.js';
import { verifyToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

/** Verify bearer authentication and resolve the current user through the DAO.
 * @param {import('express').Request} req Request.
 * @param {import('express').Response} res Response.
 * @param {import('express').NextFunction} next Next handler.
 * @returns {Promise<void>}
 * @throws {AppError} If credentials are absent or no longer valid.
 */
export async function requireAuth(req, res, next) {
  const match = /^Bearer ([^\s]+)$/i.exec(req.get('authorization') || '');
  if (!match) throw new AppError(401, 'Authentication required');
  const claims = verifyToken(match[1], 'access');
  const user = await findUserById(claims.id);
  if (!user) throw new AppError(401, 'Authentication required');
  req.user = user;
  next();
}

/** Block cross-origin browser mutation requests without enabling CORS.
 * @param {import('express').Request} req Request.
 * @param {import('express').Response} res Response.
 * @param {import('express').NextFunction} next Next handler.
 * @returns {void}
 * @throws {AppError} On an unexpected Origin.
 */
export function requireSameOrigin(req, res, next) {
  if (req.get('origin') && req.get('origin') !== env.frontendOrigin) {
    throw new AppError(403, 'Untrusted request origin');
  }
  next();
}
