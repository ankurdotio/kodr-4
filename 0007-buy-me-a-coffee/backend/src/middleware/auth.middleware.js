import { findUserById } from "../DAO/user.dao.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyAccessToken } from "../utils/jwt.js";

/**
 * Requires a valid `Authorization: Bearer <token>` header and attaches `req.user`.
 * @throws {AppError} 401 when the token is missing or the user no longer exists.
 */
export const requireAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new AppError(401, "Authentication required");
  }

  const payload = verifyAccessToken(header.slice(7));
  const user = await findUserById(payload.id);
  if (!user) {
    throw new AppError(401, "Authentication required");
  }

  req.user = user;
  next();
});
