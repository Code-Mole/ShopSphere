import Review from "../models/Review.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { sendSuccess, AppError } from "../utils/ApiResponse.js";

// ─── Get Reviews for a Product ─────────────────────────────────────────────
export const getProductReviews = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(20, Number(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ product: req.params.productId })
        .populate("user", "name avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments({ product: req.params.productId }),
    ]);

    sendSuccess(res, 200, "Reviews fetched.", reviews, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

// ─── Create Review ─────────────────────────────────────────────────────────
export const createReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment } = req.body;

    const product = await Product.findById(productId);
    if (!product) throw new AppError("Product not found.", 404);

    // One review per user per product
    const existing = await Review.findOne({
      product: productId,
      user: req.user._id,
    });
    if (existing)
      throw new AppError("You have already reviewed this product.", 400);

    // Check if user has purchased this product (verified purchase badge)
    // Order model is added in Module 5 — guard against it not existing yet
    let isVerifiedPurchase = false;
    try {
      const order = await Order.findOne({
        user: req.user._id,
        "items.product": productId,
        status: "delivered",
      });
      isVerifiedPurchase = !!order;
    } catch {
      /* Order model not yet seeded */
    }

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating,
      title: title || "",
      comment,
      isVerifiedPurchase,
    });

    await review.populate("user", "name avatar");
    sendSuccess(res, 201, "Review submitted.", review);
  } catch (error) {
    next(error);
  }
};

// ─── Update Review ─────────────────────────────────────────────────────────
export const updateReview = async (req, res, next) => {
  try {
    const review = await Review.findOne({
      _id: req.params.reviewId,
      user: req.user._id, // Users can only edit their own
    });
    if (!review) throw new AppError("Review not found.", 404);

    const { rating, title, comment } = req.body;
    if (rating) review.rating = rating;
    if (title) review.title = title;
    if (comment) review.comment = comment;

    await review.save(); // triggers post('save') → updateProductRating
    await review.populate("user", "name avatar");
    sendSuccess(res, 200, "Review updated.", review);
  } catch (error) {
    next(error);
  }
};

// ─── Delete Review ─────────────────────────────────────────────────────────
export const deleteReview = async (req, res, next) => {
  try {
    const filter = { _id: req.params.reviewId };
    // Customers can only delete their own; admins can delete any
    if (req.user.role !== "admin") filter.user = req.user._id;

    const review = await Review.findOneAndDelete(filter);
    if (!review) throw new AppError("Review not found.", 404);

    sendSuccess(res, 200, "Review deleted.");
  } catch (error) {
    next(error);
  }
};

// ─── Get My Review for a Product ──────────────────────────────────────────
export const getMyReview = async (req, res, next) => {
  try {
    const review = await Review.findOne({
      product: req.params.productId,
      user: req.user._id,
    });
    sendSuccess(res, 200, "My review fetched.", review || null);
  } catch (error) {
    next(error);
  }
};
