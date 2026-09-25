/**
 * Wraps an async Express handler, forwarding rejected promises to the error middleware.
 * @param {(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<unknown>} fn
 * @returns {import("express").RequestHandler}
 */
export function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
