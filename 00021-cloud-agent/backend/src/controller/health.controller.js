import { isDatabaseReady } from '../config/db.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';

/** Kubernetes liveness probe, independent of database readiness.
 * @param {import('express').Request} req Request.
 * @param {import('express').Response} res Response.
 * @returns {import('express').Response} Liveness envelope.
 */
export function live(req, res) {
  return sendSuccess(res, 200, 'Server is running', { status: 'ok' });
}

/** Kubernetes readiness probe.
 * @param {import('express').Request} req Request.
 * @param {import('express').Response} res Response.
 * @returns {import('express').Response} Readiness envelope.
 * @throws {AppError} If MongoDB is disconnected.
 */
export function ready(req, res) {
  if (!isDatabaseReady()) throw new AppError(503, 'Database is unavailable');
  return sendSuccess(res, 200, 'Server is ready', { status: 'ready' });
}
