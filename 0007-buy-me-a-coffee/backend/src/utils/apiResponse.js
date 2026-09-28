/**
 * Sends a standard success envelope.
 * @param {import("express").Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {unknown} [data]
 * @returns {import("express").Response}
 */
export function sendSuccess(res, statusCode, message, data = {}) {
  /** @type {import("../types/api.js").ApiSuccess} */
  const body = { success: true, message, data: data ?? null };
  return res.status(statusCode).json(body);
}
