import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { env } from "../config/env.js";
import {
    clearRefreshToken,
    createUser,
    findUserByEmail,
    findUserByIdWithRefreshToken,
    updateRefreshToken,
} from "../DAO/user.dao.js";

const REFRESH_COOKIE_NAME = "refreshToken";
const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/v1/auth",
};

/**
 * Maps a user document to its public, safe-to-return representation.
 * @param {import("mongoose").Document} user
 * @returns {{id: string, name: string, email: string}}
 */
function toPublicUser(user) {
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
    };
}

/**
 * Registers a new user and issues an access/refresh token pair.
 * @throws {AppError} 409 if the email is already registered.
 */
export const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const existing = await findUserByEmail(email);
    if (existing) {
        throw new AppError(409, "Email already registered", [
            { field: "email", message: "Email already registered" },
        ]);
    }

    const user = await createUser({ name, email, password });

    const accessToken = signAccessToken({ id: user._id.toString(), email: user.email });
    const refreshToken = signRefreshToken({ id: user._id.toString(), email: user.email });
    await updateRefreshToken(user._id.toString(), refreshToken);

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);
    sendSuccess(res, 201, "Registration successful", {
        user: toPublicUser(user),
        accessToken,
    });
});

/**
 * Authenticates a user and issues an access/refresh token pair.
 * @throws {AppError} 401 for a nonexistent user or an incorrect password.
 */
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user || !(await user.comparePassword(password))) {
        throw new AppError(401, "Invalid credentials", []);
    }

    const accessToken = signAccessToken({ id: user._id.toString(), email: user.email });
    const refreshToken = signRefreshToken({ id: user._id.toString(), email: user.email });
    await updateRefreshToken(user._id.toString(), refreshToken);

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);
    sendSuccess(res, 200, "Login successful", {
        user: toPublicUser(user),
        accessToken,
    });
});

/**
 * Verifies the refresh cookie against the persisted token and rotates both tokens.
 * @throws {AppError} 401 if the cookie is missing, invalid, or does not match the persisted token.
 */
export const refresh = asyncHandler(async (req, res) => {
    const token = req.cookies?.[ REFRESH_COOKIE_NAME ];
    if (!token) {
        throw new AppError(401, "Authentication required", []);
    }

    const payload = verifyRefreshToken(token);
    const user = await findUserByIdWithRefreshToken(payload.id);
    if (!user || user.refreshToken !== token) {
        throw new AppError(401, "Authentication required", []);
    }

    const accessToken = signAccessToken({ id: user._id.toString(), email: user.email });
    const newRefreshToken = signRefreshToken({ id: user._id.toString(), email: user.email });
    await updateRefreshToken(user._id.toString(), newRefreshToken);

    res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, REFRESH_COOKIE_OPTIONS);
    sendSuccess(res, 200, "Token refreshed", { accessToken });
});

/**
 * Clears the persisted refresh token and the refresh cookie.
 */
export const logout = asyncHandler(async (req, res) => {
    const token = req.cookies?.[ REFRESH_COOKIE_NAME ];
    if (token) {
        try {
            const payload = verifyRefreshToken(token);
            await clearRefreshToken(payload.id);
        } catch {
            // Token already invalid or expired; proceed to clear the cookie regardless.
        }
    }

    res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/v1/auth" });
    sendSuccess(res, 200, "Logout successful", {});
});

/**
 * Returns the currently authenticated user.
 * @throws {AppError} 401 if no authenticated user is attached to the request.
 */
export const me = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new AppError(401, "Authentication required", []);
    }
    sendSuccess(res, 200, "Current user", { user: toPublicUser(req.user) });
});
