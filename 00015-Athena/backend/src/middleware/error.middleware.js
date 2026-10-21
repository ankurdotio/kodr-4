import mongoose from 'mongoose';
import { env } from '../config/env.js';
import AppError from '../utils/AppError.js';

/** Map known failures to the shared API error envelope.
 * @param {Error & {statusCode?: number, errors?: Array<{field: string, message: string}>, keyValue?: Record<string, unknown>, path?: string}} error
 * @param {import('express').Request} request
 * @param {import('express').Response} response
 * @param {import('express').NextFunction} next
 * @returns {void}
 */
export function errorHandler(error, request, response, next) {
    let statusCode = 500;
    let message = 'Internal server error';
    let errors = [];

    if (error instanceof AppError) {
        statusCode = error.statusCode;
        message = error.message;
        errors = error.errors;
    } else if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
        const field = Object.keys(error.keyValue ?? {})[ 0 ] ?? 'email';
        statusCode = 409;
        message = 'A user with this email already exists';
        errors = [ { field, message: 'This value is already in use' } ];
    } else if (error instanceof mongoose.Error.CastError) {
        statusCode = 400;
        message = 'Invalid request value';
        errors = [ { field: error.path, message: 'Enter a valid value' } ];
    } else if (error?.name === 'JsonWebTokenError' || error?.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Invalid or expired token';
    } else {
        console.error(error);
    }

    /** @type {import('../types/api.js').ApiError} */
    const payload = {
        success: false,
        message,
        errors,
        ...(env.nodeEnv !== 'production' && { stack: error.stack }),
    };
    response.status(statusCode).json(payload);
}