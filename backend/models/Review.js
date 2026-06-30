import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
      default: "",
    },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      trim: true,
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// One review per user per product — enforced at DB level
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// ─── Static: Recalculate product rating after every review change ──────────
reviewSchema.statics.updateProductRating = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: "$product",
        average: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const Product = mongoose.model("Product");
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      "ratings.average": Math.round(stats[0].average * 10) / 10,
      "ratings.count": stats[0].count,
    });
  } else {
    // No reviews left — reset
    await Product.findByIdAndUpdate(productId, {
      "ratings.average": 0,
      "ratings.count": 0,
    });
  }
};

// Trigger rating recalc after save and after delete
reviewSchema.post("save", function () {
  this.constructor.updateProductRating(this.product);
});

reviewSchema.post("findOneAndDelete", function (doc) {
  if (doc) doc.constructor.updateProductRating(doc.product);
});

export default mongoose.model("Review", reviewSchema);
