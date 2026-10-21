/** Forward rejected route-handler promises to Express error middleware.
 * @param {import('express').RequestHandler} handler
 * @returns {import('express').RequestHandler}
 */
export function asyncHandler(handler) {
    return (request, response, next) => {
        Promise.resolve(handler(request, response, next)).catch(next);
    };
}