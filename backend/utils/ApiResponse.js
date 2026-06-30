/**
 * Standard success response
 * @param {object} res  - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Human-readable message
 * @param {*} data - Payload to return
 * @param {object} meta - Optional pagination / extra info
 */
export const sendSuccess = (
  res,
  statusCode = 200,
  message = "Success",
  data = null,
  meta = null,
) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  if (meta !== null) response.meta = meta;
  return res.status(statusCode).json(response);
};

/**
 * Standard error response
 */
export const sendError = (
  res,
  statusCode = 500,
  message = "Server Error",
  errors = null,
) => {
  const response = { success: false, message };
  if (errors !== null) response.errors = errors;
  return res.status(statusCode).json(response);
};

/**
 * Custom error class — throw this anywhere in the app.
 * The global errorHandler middleware will catch it.
 */
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Distinguish our errors from unexpected crashes
    Error.captureStackTrace(this, this.constructor);
  }
}
