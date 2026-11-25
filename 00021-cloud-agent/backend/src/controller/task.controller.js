import { listInstallationRepositories } from '../services/github.service.js';
import { AppError } from '../utils/AppError.js';
import { sendSuccess } from '../utils/apiResponse.js';

/** List repositories available to the user's connected installation.
 * @param {import('express').Request} req Authenticated request.
 * @param {import('express').Response} res Response.
 * @returns {Promise<import('express').Response>} Repository list.
 */
export async function githubRepositories(req, res) {
  if (!req.user.installationId || req.user.installationStatus !== 'active') {
    throw new AppError(409, 'An active GitHub App installation is required');
  }
  const repositories = await listInstallationRepositories(req.user.installationId);
  res.set('Cache-Control', 'no-store');
  return sendSuccess(res, 200, 'GitHub repositories retrieved', { repositories });
}
