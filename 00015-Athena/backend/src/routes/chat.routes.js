import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { chatMessageValidator, getMessagesValidator } from "../validators/chat.validator.js"
import { handleMessage, getConversation,getMessages } from "../controller/chat.controller.js"



const router = Router();



/**
 * @method POST
 * @description Handle user message and generate AI response.
 * @route /api/chat
 * @access Private
 * @body { content: string, conversationId?: string }
 */
router.post('/', authenticate, chatMessageValidator, validate, handleMessage)


/**
 * @method GET
 * @description Get all the conversation of the current user
 * @route /api/chat
 * @access private
 */
router.get("/", authenticate, getConversation)


/**
 * @method GET
 * @description Get all the messages of the conversation by the conversation id
 * @route /api/chat/:conversation/messages
 * @access private
 */
router.get("/:conversation/messages", authenticate, getMessagesValidator, validate, getMessages)


export default router;