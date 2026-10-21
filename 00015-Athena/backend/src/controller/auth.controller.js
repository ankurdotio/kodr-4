import {
    createUser,
    findUserByEmail,
    findUserById,
} from '../DAO/user.dao.js';
import {
    createSession,
    deleteSession,
    findSessionByToken,
    revokeSession,
    revokeUserSessions,
    rotateSession,
} from '../DAO/session.dao.js';
import { env } from '../config/env.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createAccessToken, createRefreshToken, verifyRefreshToken } from '../utils/jwt.js';

const refreshCookieName = 'refreshToken';
const refreshCookieOptions = {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'strict',
    maxAge: env.refreshTokenTtl * 1000,
    path: '/api/v1/auth',
};

function toPublicUser(user) {
    return { id: user._id.toString(), name: user.name, email: user.email };
}

function issueTokenPair(user) {
    return {
        accessToken: createAccessToken({ id: user._id.toString(), email: user.email }),
        refreshToken: createRefreshToken({ id: user._id.toString(), email: user.email }),
    };
}

/** Register an account and establish an authenticated session.
 * @type {import('express').RequestHandler}
 */
export const register = asyncHandler(async (request, response) => {
    const user = await createUser({
        name: request.body.name,
        email: request.body.email,
        password: request.body.password,
    });
    const tokens = issueTokenPair(user);
    await createSession({
        userId: user._id,
        refreshToken: tokens.refreshToken,
        userAgent: request.get('user-agent'),
    });
    response.cookie(refreshCookieName, tokens.refreshToken, refreshCookieOptions);
    return sendSuccess(response, 201, 'Registration successful', {
        accessToken: tokens.accessToken,
        user: toPublicUser(user),
    });
});

/** Verify credentials and establish an authenticated session.
 * @type {import('express').RequestHandler}
 */
export const login = asyncHandler(async (request, response) => {
    const user = await findUserByEmail(request.body.email, { includePassword: true });
    const validPassword = user && await user.comparePassword(request.body.password);
    if (!validPassword) throw new AppError(401, 'Invalid credentials');

    const tokens = issueTokenPair(user);
    await createSession({
        userId: user._id,
        refreshToken: tokens.refreshToken,
        userAgent: request.get('user-agent'),
    });
    response.cookie(refreshCookieName, tokens.refreshToken, refreshCookieOptions);
    return sendSuccess(response, 200, 'Login successful', {
        accessToken: tokens.accessToken,
        user: toPublicUser(user),
    });
});

/** Rotate a refresh token after confirming it matches persisted state.
 * @type {import('express').RequestHandler}
 */
export const refresh = asyncHandler(async (request, response) => {
    const currentToken = request.cookies?.[ refreshCookieName ];
    if (!currentToken) throw new AppError(401, 'Invalid refresh token');

    const payload = verifyRefreshToken(currentToken);
    const session = await findSessionByToken(currentToken);
    if (!session || session.userId.toString() !== payload.id) {
        throw new AppError(401, 'Invalid refresh token');
    }

    if (session.replacedBy) {
        await revokeUserSessions(session.userId.toString());
        throw new AppError(401, 'Refresh token reuse detected');
    }

    if (session.revokedAt || session.expiresAt <= new Date()) {
        throw new AppError(401, 'Invalid refresh token');
    }

    const user = await findUserById(payload.id);
    if (!user) throw new AppError(401, 'Invalid refresh token');

    const tokens = issueTokenPair(user);
    const replacementSession = await createSession({
        userId: user._id,
        refreshToken: tokens.refreshToken,
        userAgent: request.get('user-agent'),
    });
    const rotated = await rotateSession(session._id.toString(), replacementSession._id.toString());
    if (!rotated) {
        await deleteSession(replacementSession._id.toString());
        const latestSession = await findSessionByToken(currentToken);
        if (latestSession?.replacedBy) {
            await revokeUserSessions(latestSession.userId.toString());
        }
        throw new AppError(401, 'Invalid refresh token');
    }

    response.cookie(refreshCookieName, tokens.refreshToken, refreshCookieOptions);
    return sendSuccess(response, 200, 'Session refreshed', {
        accessToken: tokens.accessToken,
        user: toPublicUser(user),
    });
});

/** Invalidate the current persisted refresh token and clear its cookie.
 * @type {import('express').RequestHandler}
 */
export const logout = asyncHandler(async (request, response) => {
    const currentToken = request.cookies?.[ refreshCookieName ];
    if (currentToken) {
        try {
            const payload = verifyRefreshToken(currentToken);
            const session = await findSessionByToken(currentToken);
            if (session?.userId.toString() === payload.id && !session.revokedAt) {
                await revokeSession(session._id.toString());
            }
        } catch {
            // Logout remains successful even when the browser holds an expired cookie.
        }
    }

    response.clearCookie(refreshCookieName, refreshCookieOptions);
    return sendSuccess(response, 200, 'Logout successful', {});
});

/** Return the currently authenticated user's public profile.
 * @type {import('express').RequestHandler}
 */
export const me = asyncHandler(async (request, response) => {
    return sendSuccess(response, 200, 'Profile retrieved', { user: toPublicUser(request.user) });
});