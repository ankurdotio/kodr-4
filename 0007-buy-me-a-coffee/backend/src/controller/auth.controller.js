import {
    clearRefreshToken,
    createUser,
    findUserByEmail,
    findUserByIdWithRefreshToken,
    updateRefreshToken,
} from "../DAO/user.dao.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";

/** @typedef {import("../types/user.js").User} User */
/** @typedef {import("../types/user.js").PublicUser} PublicUser */
/** @typedef {import("../types/user.js").TokenPair} TokenPair */

const REFRESH_COOKIE = "refreshToken";
const COOKIE_PATH = "/api/v1/auth";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/** @type {import("express").CookieOptions} */
const refreshCookieOptions = {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "strict",
    path: COOKIE_PATH,
};

/**
 * Maps a user document to its public representation.
 * @param {User} user
 * @returns {PublicUser}
 */
function toPublicUser(user) {
    return {
        id: user._id.toString(),
        name: user.name,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}

/**
 * Issues a new token pair and persists the refresh token.
 * @param {User} user
 * @returns {Promise<TokenPair>}
 */
async function issueTokens(user) {
    const payload = { id: user._id.toString(), email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    await updateRefreshToken(payload.id, refreshToken);
    return { accessToken, refreshToken };
}

/**
 * Sets the refresh token cookie.
 * @param {import("express").Response} res
 * @param {string} token
 */
function setRefreshCookie(res, token) {
    res.cookie(REFRESH_COOKIE, token, { ...refreshCookieOptions, maxAge: SEVEN_DAYS_MS });
}

/**
 * POST /auth/register — creates a user and issues tokens.
 * @throws {AppError} 409 via error middleware when email or username is taken.
 */
export const register = asyncHandler(async (req, res) => {
    const { name, username, email, password } = req.body;
    const user = await createUser({ name, username, email, password });
    const { accessToken, refreshToken } = await issueTokens(user);

    setRefreshCookie(res, refreshToken);
    sendSuccess(res, 201, "Registration successful", {
        user: toPublicUser(user),
        accessToken,
    });
});

/**
 * POST /auth/login — authenticates with email and password.
 * @throws {AppError} 401 "Invalid credentials" for unknown email or wrong password.
 */
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    if (!user || !(await user.comparePassword(password))) {
        throw new AppError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await issueTokens(user);
    setRefreshCookie(res, refreshToken);
    sendSuccess(res, 200, "Login successful", {
        user: toPublicUser(user),
        accessToken,
    });
});

/**
 * POST /auth/refresh — rotates the token pair using the refresh cookie.
 * @throws {AppError} 401 when the cookie is missing or does not match the stored token.
 */
export const refresh = asyncHandler(async (req, res) => {
    const token = req.cookies?.[ REFRESH_COOKIE ];
    if (!token) throw new AppError(401, "Refresh token missing");

    const payload = verifyRefreshToken(token);
    const user = await findUserByIdWithRefreshToken(payload.id);
    if (!user || !user.refreshToken || user.refreshToken !== token) {
        if (user) await clearRefreshToken(user._id.toString());
        res.clearCookie(REFRESH_COOKIE, refreshCookieOptions);
        throw new AppError(401, "Invalid refresh token");
    }

    const tokens = await issueTokens(user);
    setRefreshCookie(res, tokens.refreshToken);
    sendSuccess(res, 200, "Token refreshed", { accessToken: tokens.accessToken });
});

/**
 * POST /auth/logout — invalidates the stored refresh token and clears the cookie.
 */
export const logout = asyncHandler(async (req, res) => {
    const token = req.cookies?.[ REFRESH_COOKIE ];
    if (token) {
        try {
            const payload = verifyRefreshToken(token);
            await clearRefreshToken(payload.id);
        } catch {
            // Invalid/expired cookie: nothing to revoke, still clear it.
        }
    }

    res.clearCookie(REFRESH_COOKIE, refreshCookieOptions);
    sendSuccess(res, 200, "Logout successful", null);
});

/**
 * GET /auth/me — returns the authenticated user.
 */
export const me = asyncHandler(async (req, res) => {
    sendSuccess(res, 200, "User fetched", { user: toPublicUser(req.user) });
});
