import { Router } from "express";
import {
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
} from "../controllers/wishlist.controller.js";
import { protect } from "../middleware/auth.js";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(protect);

router.get("/", getWishlist);
router.post(
  "/toggle",
  [
    body("productId")
      .notEmpty()
      .isMongoId()
      .withMessage("Valid product ID required"),
  ],
  validate,
  toggleWishlist,
);
router.delete("/:productId", removeFromWishlist);

export default router;
