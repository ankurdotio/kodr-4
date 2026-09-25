import { UserModel } from "../models/user.model.js";

/**
 * Creates and persists a new user document.
 * @param {{name: string, email: string, password: string}} input
 * @returns {Promise<import("mongoose").Document>} The created user document.
 */
export async function createUser(input) {
    return UserModel.create(input);
}

/**
 * Finds a user by email, including the password field.
 * @param {string} email
 * @returns {Promise<import("mongoose").Document|null>}
 */
export async function findUserByEmail(email) {
    return UserModel.findOne({ email }).select("+password");
}

/**
 * Finds a user by id without sensitive fields.
 * @param {string} id
 * @returns {Promise<import("mongoose").Document|null>}
 */
export async function findUserById(id) {
    return UserModel.findById(id);
}

/**
 * Finds a user by id, including the stored refresh token.
 * @param {string} id
 * @returns {Promise<import("mongoose").Document|null>}
 */
export async function findUserByIdWithRefreshToken(id) {
    return UserModel.findById(id).select("+refreshToken");
}

/**
 * Persists a new refresh token for the given user.
 * @param {string} id
 * @param {string} refreshToken
 * @returns {Promise<import("mongoose").Document|null>}
 */
export async function updateRefreshToken(id, refreshToken) {
    return UserModel.findByIdAndUpdate(id, { refreshToken }, { new: true });
}

/**
 * Clears the stored refresh token for the given user.
 * @param {string} id
 * @returns {Promise<import("mongoose").Document|null>}
 */
export async function clearRefreshToken(id) {
    return UserModel.findByIdAndUpdate(id, { refreshToken: null }, { new: true });
}
