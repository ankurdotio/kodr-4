import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

/**
 * Centralized error handler; the only place that writes failure responses.
 * @param {any} err
 * @param {import("express").Request} _req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} _next
 * @returns {void}
 */
export function errorHandler(err, _req, res, _next) {
    let statusCode = 500;
    let message = "Internal server error";
    /** @type {import("../types/api.js").ApiFieldError[]} */
    let errors = [];

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        errors = err.errors;
    } else if (err?.code === 11000) {
        const field = Object.keys(err.keyValue ?? err.keyPattern ?? {})[ 0 ] ?? "unknown";
        statusCode = 409;
        message = "Duplicate value";
        errors = [ { field, message: `${field} is already in use` } ];
    } else if (err?.name === "CastError") {
        statusCode = 400;
        message = "Invalid identifier";
        errors = [ { field: err.path, message: `Invalid ${err.path}` } ];
    } else if (err?.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired";
    } else if (err?.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token";
    } else if (err?.type === "entity.parse.failed") {
        statusCode = 400;
        message = "Malformed JSON body";
    } else {
        console.error(err);
    }

    /** @type {import("../types/api.js").ApiError} */
    const body = { success: false, message, errors };
    if (!env.isProduction && err?.stack) body.stack = err.stack;

    res.status(statusCode).json(body);
}
