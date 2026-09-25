import { AppError } from "../utils/AppError.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { findUserById } from "../DAO/user.dao.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Verifies the `Authorization: Bearer <token>` header and attaches the user to the request.
 * @throws {AppError} 401 if the header is missing, the token is invalid, or the user no longer exists.
 */
export const requireAuth = asyncHandler(async (req, _res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        throw new AppError(401, "Authentication required", []);
    }

    const token = header.slice("Bearer ".length);
    const payload = verifyAccessToken(token);

    const user = await findUserById(payload.id);
    if (!user) {
        throw new AppError(401, "Authentication required", []);
    }

    req.user = user;
    next();
});
