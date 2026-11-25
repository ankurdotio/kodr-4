import jwt from 'jsonwebtoken';
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

/** Mint an installation token, optionally restricted to one repository.
 * @param {number} installationId Verified installation ID.
 * @param {number} [repositoryId] Repository permitted for a task.
 * @returns {Promise<{token: string, expires_at: string}>} Ephemeral credentials.
 */
export async function createInstallationToken(installationId, repositoryId) {
  if (!env.githubAppPrivateKey || env.githubAppPrivateKey.startsWith('replace-with')) {
    throw new AppError(503, 'GitHub App private key is not configured');
  }

  let appToken;
  try {
    const now = Math.floor(Date.now() / 1000);
    appToken = jwt.sign({ iat: now - 60, exp: now + 540, iss: env.githubAppId },
      env.githubAppPrivateKey, { algorithm: 'RS256' });
  } catch {
    console.error('Unable to sign GitHub App authentication token');
    throw new AppError(503, 'GitHub App private key is invalid');
  }

  const credentials = await githubRequest(
    `https://api.github.com/app/installations/${installationId}/access_tokens`, appToken, 'POST',
    repositoryId ? { repository_ids: [repositoryId], permissions: { contents: 'write', pull_requests: 'write' } } : undefined,
  );
  if (typeof credentials?.token !== 'string' || !credentials.token) {
    throw new AppError(502, 'Invalid response from GitHub');
  }
  return credentials;
}

async function githubRequest(url, token, method = 'GET', body) {
  let response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json',
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    console.error('GitHub repository request failed');
    throw new AppError(502, 'Unable to retrieve GitHub repositories');
  }
  if (!response.ok) {
    console.error('GitHub repository request failed', response.status);
    throw new AppError(502, 'Unable to retrieve GitHub repositories');
  }
  try {
    return await response.json();
  } catch {
    throw new AppError(502, 'Invalid response from GitHub');
  }
}

/** List every repository available to an installation. */
export async function listInstallationRepositories(installationId) {
  const credentials = await createInstallationToken(installationId);

  const repositories = [];
  for (let page = 1; ; page += 1) {
    const body = await githubRequest(
      `https://api.github.com/installation/repositories?per_page=100&page=${page}`, credentials.token,
    );
    if (!Array.isArray(body?.repositories) || body.repositories.some(repo =>
      !Number.isSafeInteger(repo?.id) || typeof repo.name !== 'string' ||
      typeof repo.full_name !== 'string' || typeof repo.private !== 'boolean' ||
      typeof repo.html_url !== 'string' || typeof repo.default_branch !== 'string')) {
      throw new AppError(502, 'Invalid response from GitHub');
    }
    repositories.push(...body.repositories.map(repo => ({
      id: repo.id, name: repo.name, fullName: repo.full_name, private: repo.private,
      htmlUrl: repo.html_url, defaultBranch: repo.default_branch,
    })));
    if (body.repositories.length < 100) return repositories;
  }
}
