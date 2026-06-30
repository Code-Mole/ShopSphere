import { validationResult } from "express-validator";
import { sendError } from "../utils/ApiResponse.js";

/**
 * Run after express-validator chains.
 * Collects all errors and returns them as a single 400 response.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(
      res,
      400,
      "Validation failed",
      errors.array().map((e) => e.msg),
    );
  }
  next();
};
