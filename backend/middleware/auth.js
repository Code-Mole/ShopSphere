import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { AppError } from "../utils/ApiResponse.js";

/**
 * Protect — verifies JWT and attaches the user to req.user.
 * Use on any route that requires authentication.
 */
export const protect = async (req, res, next) => {
  try {
    // Support both Authorization header and cookies
    let token;
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) throw new AppError("Not authenticated. Please log in.", 401);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the full user (without password) to req
    const user = await User.findById(decoded.id);
    if (!user) throw new AppError("User no longer exists.", 401);
    if (!user.isActive)
      throw new AppError("Your account has been deactivated.", 403);

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Authorize — restrict route access by role.
 * Always use AFTER `protect`.
 * Usage: authorize('admin')  or  authorize('admin', 'manager')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action.", 403),
      );
    }
    next();
  };
};
