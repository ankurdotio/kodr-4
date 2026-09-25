import { AppError } from "../utils/AppError.js";
import { env } from "../config/env.js";

/**
 * The single centralized error handler; the only place that writes failure responses.
 * @param {unknown} err
 * @param {import("express").Request} _req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} _next
 */
export function errorHandler(err, _req, res, _next) {
    let statusCode = 500;
    let message = "Internal server error";
    let errors = [];

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        errors = err.errors;
    } else if (isMongoDuplicateKeyError(err)) {
        statusCode = 409;
        const field = Object.keys(err.keyValue ?? {})[ 0 ] ?? "field";
        message = "Duplicate value";
        errors = [ { field, message: `${field} already in use` } ];
    } else if (isMongoCastError(err)) {
        statusCode = 400;
        message = "Invalid identifier";
        errors = [ { field: err.path, message: `Invalid ${err.path}` } ];
    } else if (err instanceof Error && err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token";
    } else if (err instanceof Error && err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired";
    } else {
        console.error(err);
    }

    const body = { success: false, message, errors };
    if (env.nodeEnv !== "production" && err instanceof Error) {
        body.stack = err.stack;
    }

    res.status(statusCode).json(body);
}

function isMongoDuplicateKeyError(err) {
    return typeof err === "object" && err !== null && err.code === 11000;
}

function isMongoCastError(err) {
    return err instanceof Error && err.name === "CastError";
}
