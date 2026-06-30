import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true }, // Snapshot — survives product deletion
    image: { type: String, default: "" },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    variant: {
      name: { type: String, default: "" },
      value: { type: String, default: "" },
    },
  },
  { _id: true },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [orderItemSchema],
      validate: [(arr) => arr.length > 0, "Order must have at least one item"],
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String, default: "" },
      city: { type: String, required: true },
      region: { type: String, required: true },
      country: { type: String, default: "Ghana" },
    },
    deliveryOption: {
      type: String,
      enum: ["standard", "express"],
      default: "standard",
    },
    coupon: {
      code: { type: String, default: "" },
      discount: { type: Number, default: 0 },
    },
    pricing: {
      subtotal: { type: Number, required: true },
      shippingFee: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ["paystack", "stripe"], // Stripe reserved for future use
      default: "paystack",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paidAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    cancelReason: { type: String, default: "" },
  },
  { timestamps: true },
);

// Generate human-readable order number: SS-20250630-XXXXX
orderSchema.pre("save", function (next) {
  if (this.isNew) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
    this.orderNumber = `SS-${date}-${rand}`;
  }
  next();
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });

export default mongoose.model("Order", orderSchema);
