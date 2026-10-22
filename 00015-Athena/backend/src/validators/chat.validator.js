import { body, param } from 'express-validator';


/**
 * Validate and normalize chat message fields.
 * @type {import('express-validator').ValidationChain[]}
 */
export const chatMessageValidator = [
    body("content")
        .notEmpty().withMessage("Message content is required").bail()
        .isString().withMessage("Message content must be a string").bail()
        .trim()
        .isLength({ min: 1, max: 8000 }).withMessage("Message content must be between 1 and 8,000 characters").bail(),
    body("conversationId")
        .optional()
        .isMongoId().withMessage("Conversation ID must be a valid MongoDB ObjectId").bail(),
]


/**
 * Validate and normalize chat message fields.
 * @type {import('express-validator').ValidationChain[]}
 */
export const getMessagesValidator = [
    param("conversation")
        .isMongoId().withMessage("Conversation ID must be a valid MongoDB ObjectId"),
]