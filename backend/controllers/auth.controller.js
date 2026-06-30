import crypto from "crypto";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { sendSuccess, sendError, AppError } from "../utils/ApiResponse.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "../services/email.service.js";

// ─── Register ──────────────────────────────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing)
      return sendError(res, 400, "An account with this email already exists.");

    const user = await User.create({ name, email, password });

    // Generate and send the verification email
    const verifyToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });
    await sendVerificationEmail(user, verifyToken);

    sendSuccess(
      res,
      201,
      "Registration successful! Please check your email to verify your account.",
    );
  } catch (error) {
    next(error);
  }
};

// ─── Verify Email ──────────────────────────────────────────────────────────
export const verifyEmail = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user)
      return sendError(
        res,
        400,
        "Verification link is invalid or has expired.",
      );

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false });

    await sendWelcomeEmail(user);

    sendSuccess(res, 200, "Email verified successfully! You can now log in.");
  } catch (error) {
    next(error);
  }
};

// ─── Login ─────────────────────────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Explicitly select password since it's excluded by default
    const user = await User.findOne({ email }).select("+password");
    if (!user) return sendError(res, 401, "Invalid email or password.");

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return sendError(res, 401, "Invalid email or password.");

    if (!user.isEmailVerified) {
      return sendError(res, 403, "Please verify your email before logging in.");
    }

    if (!user.isActive) {
      return sendError(
        res,
        403,
        "Your account has been deactivated. Please contact support.",
      );
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    sendSuccess(res, 200, "Login successful.", {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Current User ──────────────────────────────────────────────────────
export const getMe = async (req, res, next) => {
  try {
    sendSuccess(res, 200, "User fetched.", {
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar,
        phone: req.user.phone,
        isEmailVerified: req.user.isEmailVerified,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Forgot Password ───────────────────────────────────────────────────────
export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    // Always send a success message — don't reveal if the email exists
    if (!user) {
      return sendSuccess(
        res,
        200,
        "If that email exists, a reset link has been sent.",
      );
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });
    await sendPasswordResetEmail(user, resetToken);

    sendSuccess(res, 200, "Password reset link sent to your email.");
  } catch (error) {
    next(error);
  }
};

// ─── Reset Password ────────────────────────────────────────────────────────
export const resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpire: { $gt: Date.now() },
    });

    if (!user)
      return sendError(res, 400, "Reset link is invalid or has expired.");

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();

    sendSuccess(
      res,
      200,
      "Password reset successfully. Please log in with your new password.",
    );
  } catch (error) {
    next(error);
  }
};

// ─── Change Password (authenticated) ──────────────────────────────────────
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return sendError(res, 400, "Current password is incorrect.");

    user.password = newPassword;
    await user.save();

    sendSuccess(res, 200, "Password changed successfully.");
  } catch (error) {
    next(error);
  }
};
