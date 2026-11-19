export class AppError extends Error {
  /** Create an operational API error.
   * @param {number} statusCode HTTP status.
   * @param {string} message Safe user message.
   * @param {import('../types/api.js').ApiFieldError[]} errors Field errors.
   */
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
  }
}
