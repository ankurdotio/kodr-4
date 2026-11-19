/** Forward asynchronous failures to the centralized error handler.
 * @param {import('express').RequestHandler} handler Async route handler.
 * @returns {import('express').RequestHandler} Wrapped handler.
 */
export function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}
