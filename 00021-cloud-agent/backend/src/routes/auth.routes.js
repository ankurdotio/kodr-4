import { Router } from 'express';
import * as auth from '../controller/auth.controller.js';
import { requireAuth, requireSameOrigin } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { installationValidator } from '../validators/auth.validator.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/** GitHub-only authentication routes; passwords and registration forms are intentionally absent. */
export const authRoutes = Router();
authRoutes.get('/github', auth.githubLogin);
authRoutes.get('/github/callback', auth.githubCallback);
authRoutes.get('/github/install/callback', installationValidator, validate, auth.installationCallback);
authRoutes.post('/github/connect', requireSameOrigin, asyncHandler(requireAuth), asyncHandler(auth.connectGithub));
authRoutes.post('/refresh', requireSameOrigin, asyncHandler(auth.refresh));
authRoutes.post('/logout', requireSameOrigin, asyncHandler(requireAuth), asyncHandler(auth.logout));
authRoutes.get('/me', asyncHandler(requireAuth), auth.me);
