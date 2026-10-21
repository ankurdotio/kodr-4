import AppError from '../utils/AppError.js';

/** Forward unmatched routes to the centralized error handler.
 * @param {import('express').Request} request
 * @param {import('express').Response} response
 * @param {import('express').NextFunction} next
 * @returns {void}
 */
export function notFound(request, response, next) {
    return next(new AppError(404, 'Route not found'));
}