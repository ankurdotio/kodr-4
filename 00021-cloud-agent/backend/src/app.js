import express from 'express';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { requestLogger } from './config/logger.js';
import { routes } from './routes/index.routes.js';
import { notFound } from './middleware/notFound.middleware.js';
import { errorMiddleware } from './middleware/error.middleware.js';

export const app = express();
app.disable('x-powered-by');
app.use(express.json({
  limit: '1mb',
  verify(req, res, buffer) {
    if (req.originalUrl.split('?')[0] === '/api/v1/webhook/github/event') req.rawBody = buffer;
  },
}));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser());
if (env.nodeEnv !== 'test') {
  // Avoid logging OAuth codes, state, cookies, or bearer tokens.
  app.use(requestLogger);
}
app.use('/api/v1', routes);
app.use(notFound);
app.use(errorMiddleware);
