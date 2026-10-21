import { Router } from 'express';
import authRouter from './auth.routes.js';
import chatRouter from './chat.routes.js';

const apiRouter = Router();

/** Mount versioned API route groups.
 * @type {Router}
 */
apiRouter.use('/auth', authRouter);
apiRouter.use('/chat', chatRouter);

export default apiRouter;