import { body } from 'express-validator';

/** Validate and normalize registration fields.
 * @type {import('express-validator').ValidationChain[]}
 */
export const registerValidator = [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('email').isEmail().withMessage('Enter a valid email address').normalizeEmail(),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[A-Za-z]/).withMessage('Password must contain a letter')
        .matches(/[0-9]/).withMessage('Password must contain a number'),
];

/** Validate login fields without disclosing which credential was incorrect.
 * @type {import('express-validator').ValidationChain[]}
 */
export const loginValidator = [
    body('email').isEmail().withMessage('Enter a valid email address').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
];