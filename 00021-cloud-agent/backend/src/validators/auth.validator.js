import { query } from 'express-validator';

/** Validate the untrusted GitHub installation callback.
 * @returns {import('express-validator').ValidationChain[]} Named validation chains.
 */
export const installationValidator = [
  query('installation_id').isInt({ min: 1 }).withMessage('Invalid installation ID').bail().toInt(),
  query('state').isString().isLength({ min: 32, max: 128 }).withMessage('Invalid installation state'),
];
