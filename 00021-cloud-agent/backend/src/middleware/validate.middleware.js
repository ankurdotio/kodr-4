import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';

/** Reject invalid fields with the shared error envelope.
 * @param {import('express').Request} req Request.
 * @param {import('express').Response} res Response.
 * @param {import('express').NextFunction} next Next middleware.
 * @returns {void}
 * @throws {AppError} If validation fails.
 */
export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(422, 'Validation failed', errors.array().map(err => ({
      field: err.type === 'field' ? err.path : 'request', message: err.msg,
    })));
  }
  next();
}
