import { Router } from "express";
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  getMyReview,
} from "../controllers/review.controller.js";
import { protect, authorize } from "../middleware/auth.js";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";

const router = Router({ mergeParams: true }); // mergeParams to access :productId

const reviewValidator = [
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("comment")
    .trim()
    .notEmpty()
    .withMessage("Comment is required")
    .isLength({ max: 1000 })
    .withMessage("Comment cannot exceed 1000 characters"),
];

router.get("/", getProductReviews);
router.get("/my-review", protect, getMyReview);
router.post("/", protect, reviewValidator, validate, createReview);
router.put("/:reviewId", protect, reviewValidator, validate, updateReview);
router.delete("/:reviewId", protect, deleteReview);

export default router;
