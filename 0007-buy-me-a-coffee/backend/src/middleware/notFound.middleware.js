import { AppError } from "../utils/AppError.js";

/**
 * Throws a 404 for unmatched routes.
 * @throws {AppError}
 */
export function notFound() {
    throw new AppError(404, "Route not found");
}
