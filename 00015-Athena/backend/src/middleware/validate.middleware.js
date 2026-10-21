import { validationResult } from 'express-validator';
import AppError from '../utils/AppError.js';

/** Reject requests that fail their express-validator chains.
 * @param {import('express').Request} request
 * @param {import('express').Response} response
 * @param {import('express').NextFunction} next
 * @returns {void}
 * @throws {AppError} When one or more input fields are invalid.
 */
export function validate(request, response, next) {
    const validationErrors = validationResult(request);
    if (!validationErrors.isEmpty()) {
        const fieldErrors = validationErrors.array().map((error) => ({
            field: error.path,
            message: error.msg,
        }));
        return next(new AppError(422, 'Validation failed', fieldErrors));
    }
    return next();
}