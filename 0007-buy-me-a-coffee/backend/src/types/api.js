/**
 * Shared API envelope types (JSDoc only).
 *
 * @typedef {Object} ApiFieldError
 * @property {string} field
 * @property {string} message
 *
 * @typedef {Object} ApiSuccess
 * @property {true} success
 * @property {string} message
 * @property {unknown} data
 *
 * @typedef {Object} ApiError
 * @property {false} success
 * @property {string} message
 * @property {ApiFieldError[]} errors
 * @property {string} [stack]
 */

export { };
