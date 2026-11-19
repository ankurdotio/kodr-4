import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

/** Centralized failure writer; unexpected details never enter production responses.
 * @param {Error} err Failure.
 * @param {import('express').Request} req Request.
 * @param {import('express').Response} res Response.
 * @param {import('express').NextFunction} next Next error handler.
 * @returns {void}
 */
export function errorMiddleware(err, req, res, next) {
  if (res.headersSent) { next(err); return; }
  let status = 500;
  /** @type {import('../types/api.js').ApiError} */
  const body = { success: false, message: 'Internal server error', errors: [] };
  if (err instanceof AppError) {
    status = err.statusCode;
    body.message = err.message;
    body.errors = err.errors;
  } else if (err.code === 11000) {
    status = 409;
    body.message = 'Record already exists';
    body.errors = [{ field: Object.keys(err.keyPattern || {})[0] || 'record', message: 'Already exists' }];
  } else if (err.name === 'CastError') {
    status = 400;
    body.message = 'Invalid identifier';
    body.errors = [{ field: err.path || 'id', message: 'Invalid value' }];
  } else if (['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError'].includes(err.name)) {
    status = 401;
    body.message = 'Invalid or expired authentication token';
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    body.message = 'Invalid JSON body';
  } else if (err.type === 'entity.too.large') {
    status = 413;
    body.message = 'Request body is too large';
  } else {
    console.error('Unhandled request failure', err);
  }
  if (env.nodeEnv !== 'production') body.stack = err.stack;
  res.status(status).json(body);
}
