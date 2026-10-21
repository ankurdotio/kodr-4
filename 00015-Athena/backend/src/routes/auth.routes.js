import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { login, logout, me, refresh, register } from '../controller/auth.controller.js';
import { loginValidator, registerValidator } from '../validators/auth.validator.js';

const authRouter = Router();

/** Declare the authentication endpoints and their middleware.
 * @type {Router}
 */
authRouter.post('/register', registerValidator, validate, register);
authRouter.post('/login', loginValidator, validate, login);
authRouter.post('/refresh', refresh);
authRouter.post('/logout', logout);
authRouter.get('/me', authenticate, me);

export default authRouter;