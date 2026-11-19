/**
 * @typedef {object} PublicUser
 * @property {string} id Internal user identifier.
 * @property {string} githubId GitHub account identifier.
 * @property {string} username GitHub login.
 * @property {string} name Display name.
 * @property {string} avatarUrl GitHub avatar.
 * @property {number|null} installationId Verified GitHub App installation.
 * @property {string} installationStatus Installation state.
 * @property {string} installationAccount Installation account login.
 * @property {Date} createdAt Registration time.
 */
/**
 * @typedef {object} TokenPair
 * @property {string} accessToken Fifteen-minute bearer token.
 * @property {string} refreshToken Seven-day refresh token.
 */
export {};
