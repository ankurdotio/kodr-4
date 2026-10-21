/** @typedef {{success: true, message: string, data: unknown}} ApiSuccess */
/** @typedef {{field: string, message: string}} ApiFieldError */
/** @typedef {{success: false, message: string, errors: ApiFieldError[], stack?: string}} ApiError */
export {};