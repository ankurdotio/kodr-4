export default class AppError extends Error {
    /** Create an operational error for the centralized error middleware.
     * @param {number} statusCode
     * @param {string} message
     * @param {Array<{field: string, message: string}>} [errors]
     */
    constructor(statusCode, message, errors = []) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.errors = errors;
        this.isOperational = true;
        Error.captureStackTrace?.(this, this.constructor);
    }
}