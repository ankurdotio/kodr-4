/**
 * A typed application error carrying an HTTP status code and optional field errors.
 */
export class AppError extends Error {
    /**
     * @param {number} statusCode - The HTTP status code to respond with.
     * @param {string} message - A human-readable error message.
     * @param {{field: string, message: string}[]} [errors] - Optional field-level validation errors.
     */
    constructor(statusCode, message, errors = []) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
