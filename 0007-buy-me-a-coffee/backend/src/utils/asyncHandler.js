/**
 * Wraps an async route handler and forwards rejections to the error middleware.
 * @param {import("express").RequestHandler} fn
 * @returns {import("express").RequestHandler}
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
