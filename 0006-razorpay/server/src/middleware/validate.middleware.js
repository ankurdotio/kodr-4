import { validationResult } from "express-validator";
import { AppError } from "../utils/AppError.js";

/**
 * Collects express-validator results and throws an AppError on failure.
 * @param {import("express").Request} req
 * @param {import("express").Response} _res
 * @param {import("express").NextFunction} next
 * @throws {AppError} 422 with field-level validation errors.
 */
export function validate(req, _res, next) {
    const result = validationResult(req);
    if (result.isEmpty()) {
        return next();
    }

    const fieldErrors = result.array().map((err) => ({
        field: "path" in err ? String(err.path) : "unknown",
        message: err.msg,
    }));

    next(new AppError(422, "Validation failed", fieldErrors));
}
