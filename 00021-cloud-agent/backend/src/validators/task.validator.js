import { body, header, param } from 'express-validator';

export const createTaskValidator = [
  body('userInput').isString().bail().trim().isLength({ min: 1, max: 20000 })
    .withMessage('User input must contain between 1 and 20000 characters'),
  body('repo').isObject({ strict: true }).withMessage('Repository is required'),
  body('repo.id').custom(value => Number.isSafeInteger(value) && value > 0)
    .withMessage('Repository ID must be a positive integer'),
  body('repo.htmlUrl').isString().bail()
    .matches(/^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/)
    .withMessage('Repository URL must be a GitHub repository HTML URL'),
];

export const taskEventValidator = [
  param('taskID').isMongoId().withMessage('Invalid task ID'),
  header('last-event-id').optional().matches(/^\d{1,20}-\d{1,20}$/).withMessage('Invalid event cursor'),
];
