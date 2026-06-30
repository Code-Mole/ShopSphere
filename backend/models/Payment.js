import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reference: {
      type: String,
      required: true,
      unique: true, // Paystack transaction reference
    },
    amount: {
      type: Number,
      required: true, // Stored in GHS (major unit), not pesewas
    },
    currency: {
      type: String,
      default: "GHS",
    },
    method: {
      type: String,
      enum: ["card", "mobile_money", "bank_transfer", "unknown"],
      default: "unknown",
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed, // Raw response from Paystack — useful for audits
      default: {},
    },
    paidAt: Date,
  },
  { timestamps: true },
);

paymentSchema.index({ reference: 1 });
paymentSchema.index({ order: 1 });

export default mongoose.model("Payment", paymentSchema);
