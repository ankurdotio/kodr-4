import { AppError } from '../utils/AppError.js';

/** Reject unknown routes.
 * @returns {never} Always throws.
 * @throws {AppError} Route not found.
 */
export function notFound() {
  throw new AppError(404, 'Route not found');
}
