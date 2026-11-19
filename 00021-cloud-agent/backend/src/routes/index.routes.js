import { Router } from 'express';
import { authRoutes } from './auth.routes.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { activity, githubEvent } from '../controller/webhook.controller.js';
import { live, ready } from '../controller/health.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/** Versioned application routes. */
export const routes = Router();
routes.use('/auth', authRoutes);
routes.post('/webhook/github/event', asyncHandler(githubEvent));
routes.get('/activity', asyncHandler(requireAuth), asyncHandler(activity));
routes.get('/health/live', live);
routes.get('/health/ready', ready);
