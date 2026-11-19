/** Send the standard success envelope.
 * @param {import('express').Response} res Express response.
 * @param {number} statusCode HTTP status.
 * @param {string} message Human-readable message.
 * @param {unknown} data Response data.
 * @returns {import('express').Response} Sent response.
 */
export function sendSuccess(res, statusCode, message, data) {
  /** @type {import('../types/api.js').ApiSuccess} */
  const body = { success: true, message, data };
  return res.status(statusCode).json(body);
}
