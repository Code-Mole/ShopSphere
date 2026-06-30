import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [0, "Discount value cannot be negative"],
    },
    minOrderAmount: {
      type: Number,
      default: 0, // Minimum cart subtotal to use this coupon
    },
    maxDiscountAmount: {
      type: Number,
      default: null, // Cap for percentage discounts
    },
    usageLimit: {
      type: Number,
      default: null, // null = unlimited
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiry date is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// ─── Instance Method: validate and calculate discount ──────────────────────
couponSchema.methods.calculateDiscount = function (subtotal) {
  if (!this.isActive) throw new Error("This coupon is no longer active.");
  if (this.expiresAt < new Date()) throw new Error("This coupon has expired.");
  if (this.usageLimit && this.usedCount >= this.usageLimit) {
    throw new Error("This coupon has reached its usage limit.");
  }
  if (subtotal < this.minOrderAmount) {
    throw new Error(
      `Minimum order amount of GH₵${this.minOrderAmount} required.`,
    );
  }

  let discount =
    this.discountType === "percentage"
      ? (subtotal * this.discountValue) / 100
      : this.discountValue;

  if (this.maxDiscountAmount && discount > this.maxDiscountAmount) {
    discount = this.maxDiscountAmount;
  }

  return Math.min(discount, subtotal); // Discount can never exceed subtotal
};

couponSchema.index({ code: 1 });

export default mongoose.model("Coupon", couponSchema);
