/**
 * Shared user domain types (JSDoc only).
 *
 * @typedef {Object} User
 * @property {import("mongoose").Types.ObjectId} _id
 * @property {string} name
 * @property {string} username
 * @property {string} email
 * @property {string} [password]
 * @property {string | null} [refreshToken]
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {(candidate: string) => Promise<boolean>} comparePassword
 *
 * @typedef {Object} RegisterInput
 * @property {string} name
 * @property {string} username
 * @property {string} email
 * @property {string} password
 *
 * @typedef {Object} LoginInput
 * @property {string} email
 * @property {string} password
 *
 * @typedef {Object} PublicUser
 * @property {string} id
 * @property {string} name
 * @property {string} username
 * @property {string} email
 * @property {Date} createdAt
 * @property {Date} updatedAt
 *
 * @typedef {Object} TokenPair
 * @property {string} accessToken
 * @property {string} refreshToken
 */

export {};
