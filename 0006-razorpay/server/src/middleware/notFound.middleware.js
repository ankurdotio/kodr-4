import { AppError } from "../utils/AppError.js";

/** Throws a 404 AppError for any unmatched route. */
export function notFound(_req, _res, next) {
    next(new AppError(404, "Route not found"));
}
