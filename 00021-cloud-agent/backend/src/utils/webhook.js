import { createHmac, timingSafeEqual } from 'node:crypto';
import { AppError } from './AppError.js';

/** Authenticate the exact raw bytes of a GitHub webhook.
 * @param {Buffer} body Original request body.
 * @param {string} signature X-Hub-Signature-256.
 * @param {string} secret Configured webhook secret.
 * @returns {void}
 * @throws {AppError} If the signature is absent or invalid.
 */
export function verifyWebhookSignature(body, signature, secret) {
  if (!Buffer.isBuffer(body) || !/^sha256=[a-f\d]{64}$/.test(signature || '')) {
    throw new AppError(401, 'Invalid webhook signature');
  }
  const expected = createHmac('sha256', secret).update(body).digest();
  const actual = Buffer.from(signature.slice(7), 'hex');
  if (!timingSafeEqual(actual, expected)) throw new AppError(401, 'Invalid webhook signature');
}
