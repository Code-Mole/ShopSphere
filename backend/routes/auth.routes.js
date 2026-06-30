import { Router } from "express";
import {
  register,
  verifyEmail,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from "../validators/auth.validator.js";

const router = Router();

router.post("/register", registerValidator, validate, register);
router.get("/verify-email/:token", verifyEmail);
router.post("/login", loginValidator, validate, login);
router.get("/me", protect, getMe);
router.post(
  "/forgot-password",
  forgotPasswordValidator,
  validate,
  forgotPassword,
);
router.post(
  "/reset-password/:token",
  resetPasswordValidator,
  validate,
  resetPassword,
);
router.put("/change-password", protect, changePassword);

export default router;
