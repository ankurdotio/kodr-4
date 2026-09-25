/**
 * Sends a standard-envelope success response.
 * @param {import("express").Response} res - The Express response object.
 * @param {number} statusCode - The HTTP status code to respond with.
 * @param {string} message - A human-readable success message.
 * @param {unknown} data - The response payload.
 */
export function sendSuccess(res, statusCode, message, data) {
    res.status(statusCode).json({ success: true, message, data });
}
