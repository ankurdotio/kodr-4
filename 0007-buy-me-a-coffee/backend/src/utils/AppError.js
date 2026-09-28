/**
 * Operational error carrying an HTTP status code and optional field errors.
 */
export class AppError extends Error {
    /**
     * @param {number} statusCode
     * @param {string} message
     * @param {import("../types/api.js").ApiFieldError[]} [errors]
     */
    constructor(statusCode, message, errors = []) {
        super(message);
        this.name = "AppError";
        this.statusCode = statusCode;
        this.errors = errors;
        this.isOperational = true;
        Error.captureStackTrace?.(this, this.constructor);
    }
}
