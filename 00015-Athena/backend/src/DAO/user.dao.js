import UserModel from '../models/user.model.js';

/** Create a user and return the persisted document.
 * @param {{name: string, email: string, password: string}} userData
 * @returns {Promise<import('mongoose').HydratedDocument<unknown>>}
 */
export async function createUser(userData) {
    return UserModel.create(userData);
}

/** Find a user by normalized email, optionally including the password hash.
 * @param {string} email
 * @param {{includePassword?: boolean}} [options]
 * @returns {Promise<import('mongoose').HydratedDocument<unknown> | null>}
 */
export async function findUserByEmail(email, options = {}) {
    const query = UserModel.findOne({ email });
    if (options.includePassword) query.select('+password');
    return query.exec();
}

/** Find a user by its database ID.
 * @param {string} userId
 * @returns {Promise<import('mongoose').HydratedDocument<unknown> | null>}
 */
export async function findUserById(userId) {
    return UserModel.findById(userId).exec();
}
