import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true },
);

// Prevent duplicate products in the wishlist at DB level
wishlistSchema.index({ user: 1, products: 1 });

export default mongoose.model("Wishlist", wishlistSchema);
