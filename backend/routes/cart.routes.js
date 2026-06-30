import { Router } from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cart.controller.js";
import { protect } from "../middleware/auth.js";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";

const router = Router();

// All cart routes require authentication
router.use(protect);

router.get("/", getCart);
router.post(
  "/",
  [
    body("productId")
      .notEmpty()
      .isMongoId()
      .withMessage("Valid product ID required"),
    body("quantity")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
  ],
  validate,
  addToCart,
);
router.put(
  "/:itemId",
  [
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
  ],
  validate,
  updateCartItem,
);
router.delete("/:itemId", removeFromCart);
router.delete("/", clearCart);

export default router;
