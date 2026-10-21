import { findUserById } from '../DAO/user.dao.js';
import AppError from '../utils/AppError.js';
import { verifyAccessToken } from '../utils/jwt.js';

/** Authenticate a request using a bearer access token.
 * @param {import('express').Request} request
 * @param {import('express').Response} response
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 */
export async function authenticate(request, response, next) {
  try {
    const authorization = request.get('authorization') ?? '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
    if (!token) throw new AppError(401, 'Authentication required');

    const payload = verifyAccessToken(token);
    const user = await findUserById(payload.id);
    if (!user) throw new AppError(401, 'Authentication required');

    request.user = user;
    return next();
  } catch (error) {
    return next(error instanceof AppError ? error : new AppError(401, 'Authentication required'));
  }
}