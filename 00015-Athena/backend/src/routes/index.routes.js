import { Router } from 'express';
import authRouter from './auth.routes.js';

const apiRouter = Router();

/** Mount versioned API route groups.
 * @type {Router}
 */
apiRouter.use('/auth', authRouter);

export default apiRouter;