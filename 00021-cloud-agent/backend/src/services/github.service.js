import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

/** Read only installations accessible to this GitHub OAuth user.
 * @param {string} accessToken Short-lived GitHub user token, never persisted.
 * @param {number|undefined} installationId Optional expected installation.
 * @returns {Promise<object|null>} Installation belonging to the configured app.
 * @throws {AppError} If GitHub cannot verify access.
 */
export async function findGithubInstallation(accessToken, installationId) {
  for (let page = 1; page <= 100; page += 1) {
    const response = await fetch(`https://api.github.com/user/installations?per_page=100&page=${page}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      console.error('GitHub installation lookup failed', response.status);
      throw new AppError(502, 'Unable to verify GitHub App installation');
    }
    const body = await response.json();
    if (!Array.isArray(body.installations)) throw new AppError(502, 'Invalid response from GitHub');
    const found = body.installations.find(item =>
      String(item.app_id) === env.githubAppId && (!installationId || item.id === installationId));
    if (found) return found;
    if (body.installations.length < 100) return null;
  }
  throw new AppError(502, 'Too many GitHub installations to verify');
}
