import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { chatMessageValidator } from "../validators/chat.validator.js"



const router = Router();


router.post('/', authenticate, chatMessageValidator, validate,)


export default router;