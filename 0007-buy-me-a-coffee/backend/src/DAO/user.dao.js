import { UserModel } from "../models/user.model.js";

/** @typedef {import("../types/user.js").User} User */
/** @typedef {import("../types/user.js").RegisterInput} RegisterInput */

/**
 * Creates and persists a new user (password is hashed by the model hook).
 * @param {RegisterInput} input
 * @returns {Promise<User>}
 */
export async function createUser(input) {
  return UserModel.create(input);
}

/**
 * Finds a user by email, including the password hash.
 * @param {string} email
 * @returns {Promise<User | null>}
 */
export async function findUserByEmail(email) {
  return UserModel.findOne({ email: email.toLowerCase() }).select("+password");
}

/**
 * Finds a user by id.
 * @param {string} id
 * @returns {Promise<User | null>}
 */
export async function findUserById(id) {
  return UserModel.findById(id);
}

/**
 * Finds a user by id, including the stored refresh token.
 * @param {string} id
 * @returns {Promise<User | null>}
 */
export async function findUserByIdWithRefreshToken(id) {
  return UserModel.findById(id).select("+refreshToken");
}

/**
 * Persists a new refresh token for the user.
 * @param {string} id
 * @param {string} refreshToken
 * @returns {Promise<User | null>}
 */
export async function updateRefreshToken(id, refreshToken) {
  return UserModel.findByIdAndUpdate(id, { refreshToken }, { new: true });
}

/**
 * Clears the stored refresh token for the user.
 * @param {string} id
 * @returns {Promise<User | null>}
 */
export async function clearRefreshToken(id) {
  return UserModel.findByIdAndUpdate(id, { refreshToken: null }, { new: true });
}
