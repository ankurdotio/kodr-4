import { UserModel } from '../models/user.model.js';

/** Create a GitHub user.
 * @param {object} input Validated GitHub profile.
 * @returns {Promise<object>} Created plain user.
 */
export async function createUser(input) {
  return (await UserModel.create(input)).toObject();
}

/** Find a GitHub identity.
 * @param {string} githubId GitHub account ID.
 * @returns {Promise<object|null>} Matching user.
 */
export async function findUserByGithubId(githubId) {
  return UserModel.findOne({ githubId }).lean();
}

/** Find a public authentication record.
 * @param {string} id User ID.
 * @returns {Promise<object|null>} Matching user.
 */
export async function findUserById(id) {
  return UserModel.findById(id).lean();
}

/** Find a record including the refresh hash.
 * @param {string} id User ID.
 * @returns {Promise<object|null>} Matching record.
 */
export async function findUserByIdWithRefreshToken(id) {
  return UserModel.findById(id).select('+refreshToken').lean();
}

/** Save a refresh hash and optionally rotate with compare-and-swap.
 * @param {string} id User ID.
 * @param {string} tokenHash New SHA-256 hash.
 * @param {string|undefined} expectedHash Expected previous hash.
 * @returns {Promise<object|null>} Updated user or null on replay.
 */
export async function updateRefreshToken(id, tokenHash, expectedHash) {
  const filter = { _id: id };
  if (expectedHash !== undefined) filter.refreshToken = expectedHash;
  return UserModel.findOneAndUpdate(filter, { refreshToken: tokenHash }, { new: true }).lean();
}

/** Revoke only the supplied session, without logging out a newer one.
 * @param {string} id User ID.
 * @param {string} expectedHash Refresh hash.
 * @returns {Promise<object|null>} Updated record.
 */
export async function clearRefreshToken(id, expectedHash) {
  return UserModel.findOneAndUpdate(
    { _id: id, refreshToken: expectedHash }, { refreshToken: null }, { new: true },
  ).lean();
}

/** Persist verified installation ownership.
 * @param {string} id User ID.
 * @param {object} installation Installation returned by GitHub.
 * @returns {Promise<object|null>} Updated user.
 */
export async function updateInstallation(id, installation) {
  return UserModel.findByIdAndUpdate(id, { $set: installation }, { new: true }).lean();
}

/** Apply a signed installation lifecycle event.
 * @param {number} installationId Verified installation identifier.
 * @param {string} installationStatus New lifecycle state.
 * @returns {Promise<object>} Write result.
 */
export async function updateInstallationStatus(installationId, installationStatus) {
  return UserModel.updateMany({ installationId }, { $set: { installationStatus } });
}
