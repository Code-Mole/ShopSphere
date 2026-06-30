import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    label: { type: String, default: "Home" }, // Home, Work, etc.
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    addressLine1: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    addressLine2: { type: String, default: "", trim: true },
    city: { type: String, required: [true, "City is required"], trim: true },
    region: {
      type: String,
      required: [true, "Region is required"],
      trim: true,
    }, // Ghana regions
    country: { type: String, default: "Ghana" },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Ensure only one default address per user
addressSchema.pre("save", async function (next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isDefault: false },
    );
  }
  next();
});

export default mongoose.model("Address", addressSchema);
