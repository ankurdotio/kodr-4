import { validationResult } from "express-validator";
import { AppError } from "../utils/AppError.js";

/**
 * Converts express-validator results into a 422 AppError.
 * @param {import("express").Request} req
 * @param {import("express").Response} _res
 * @param {import("express").NextFunction} next
 * @returns {void}
 * @throws {AppError} 422 when validation fails.
 */
export function validate(req, _res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const fieldErrors = result.array().map((err) => ({
    field: err.type === "field" ? err.path : err.type,
    message: String(err.msg),
  }));
  throw new AppError(422, "Validation failed", fieldErrors);
}
