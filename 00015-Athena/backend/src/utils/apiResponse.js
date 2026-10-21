/** Send a typed success envelope.
 * @param {import('express').Response} response
 * @param {number} statusCode
 * @param {string} message
 * @param {unknown} data
 * @returns {import('express').Response}
 */
export function sendSuccess(response, statusCode, message, data) {
  return response.status(statusCode).json({ success: true, message, data });
}