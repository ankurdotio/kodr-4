import { Router } from 'express';
import { authRoutes } from './auth.routes.js';
import { requireAuth, requireSameOrigin } from '../middleware/auth.middleware.js';
import { activity, githubEvent } from '../controller/webhook.controller.js';
import { live, ready } from '../controller/health.controller.js';
import { createTask, githubRepositories, taskEvents } from '../controller/task.controller.js';
import { createTaskValidator, taskEventValidator } from '../validators/task.validator.js';
import { validate } from '../middleware/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/** Versioned application routes. */
export const routes = Router();
routes.use('/auth', authRoutes);
routes.post('/webhook/github/event', asyncHandler(githubEvent));
routes.get('/activity', asyncHandler(requireAuth), asyncHandler(activity));
routes.get('/task/github/repos', asyncHandler(requireAuth), asyncHandler(githubRepositories));
routes.post('/task', requireSameOrigin, asyncHandler(requireAuth), createTaskValidator, validate, asyncHandler(createTask));
routes.get('/task/event/:taskID', asyncHandler(requireAuth), taskEventValidator, validate, asyncHandler(taskEvents));
routes.get('/health/live', live);
routes.get('/health/ready', ready);
