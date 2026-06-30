import mongoose from "mongoose";

// Embedded sub-schema for product variants (size, color, etc.)
const variantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "Color" or "Size"
    value: { type: String, required: true }, // e.g. "Red" or "XL"
    price: { type: Number, default: 0 }, // price difference from base
    stock: { type: Number, default: 0 },
    sku: { type: String, default: "" },
  },
  { _id: true },
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Product name cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    comparePrice: {
      type: Number,
      default: 0, // Original price before discount — shown as strikethrough
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    brand: {
      type: String,
      trim: true,
      default: "",
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true }, // Cloudinary public_id for deletion
      },
    ],
    variants: [variantSchema],
    tags: [{ type: String, lowercase: true, trim: true }],
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple docs with no SKU
      trim: true,
    },
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isDigital: { type: Boolean, default: false },
    weight: { type: Number, default: 0 }, // in grams — for shipping calculations
    dimensions: {
      length: { type: Number, default: 0 },
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
    },
    soldCount: { type: Number, default: 0 }, // incremented on each sale
  },
  {
    timestamps: true,
    // Add virtual fields to JSON output
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ─── Virtual: discount percentage ─────────────────────────────────────────
productSchema.virtual("discountPercent").get(function () {
  if (!this.comparePrice || this.comparePrice <= this.price) return 0;
  return Math.round(
    ((this.comparePrice - this.price) / this.comparePrice) * 100,
  );
});

// ─── Virtual: in stock boolean ────────────────────────────────────────────
productSchema.virtual("inStock").get(function () {
  return this.stock > 0;
});

// ─── Pre-save: auto slug ──────────────────────────────────────────────────
productSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug =
      this.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      Date.now();
  }
  next();
});

// ─── Indexes for fast queries ──────────────────────────────────────────────
productSchema.index({
  name: "text",
  description: "text",
  tags: "text",
  brand: "text",
});
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ "ratings.average": -1 });
productSchema.index({ soldCount: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ slug: 1 });

export default mongoose.model("Product", productSchema);
