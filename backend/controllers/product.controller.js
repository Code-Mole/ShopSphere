import Product from "../models/Product.js";
import Category from "../models/Category.js";
import { sendSuccess, sendError, AppError } from "../utils/ApiResponse.js";
import { uploadImage, deleteImage } from "../services/cloudinary.service.js";

// ─── Get All Products (with search, filter, sort, pagination) ──────────────
export const getProducts = async (req, res, next) => {
  try {
    const {
      keyword,
      category,
      brand,
      minPrice,
      maxPrice,
      sort = "-createdAt",
      page = 1,
      limit = 12,
      featured,
      inStock,
    } = req.query;

    const filter = { isActive: true };

    // Full-text search
    if (keyword) {
      filter.$text = { $search: keyword };
    }

    // Category filter — accept both id and slug
    if (category) {
      const cat = await Category.findOne({
        $or: [{ _id: category }, { slug: category }],
      });
      if (cat) filter.category = cat._id;
    }

    if (brand) filter.brand = { $regex: brand, $options: "i" };
    if (featured) filter.isFeatured = true;
    if (inStock === "true") filter.stock = { $gt: 0 };

    // Price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Sort mapping — user sends friendly strings
    const sortMap = {
      "-createdAt": { createdAt: -1 },
      "price-asc": { price: 1 },
      "price-desc": { price: -1 },
      rating: { "ratings.average": -1 },
      popular: { soldCount: -1 },
    };
    const sortQuery = sortMap[sort] || { createdAt: -1 };

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug")
        .sort(sortQuery)
        .skip(skip)
        .limit(limitNum)
        .select("-__v"),
      Product.countDocuments(filter),
    ]);

    sendSuccess(res, 200, "Products fetched.", products, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Single Product ────────────────────────────────────────────────────
export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      $or: [{ slug: req.params.slug }, { _id: req.params.slug }],
      isActive: true,
    }).populate("category", "name slug");

    if (!product) throw new AppError("Product not found.", 404);
    sendSuccess(res, 200, "Product fetched.", product);
  } catch (error) {
    next(error);
  }
};

// ─── Get Related Products ──────────────────────────────────────────────────
export const getRelatedProducts = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) throw new AppError("Product not found.", 404);

    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true,
    })
      .limit(8)
      .select("name slug price comparePrice images ratings brand");

    sendSuccess(res, 200, "Related products fetched.", related);
  } catch (error) {
    next(error);
  }
};

// ─── Get Featured Products ─────────────────────────────────────────────────
export const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isFeatured: true, isActive: true })
      .populate("category", "name slug")
      .limit(8)
      .select("name slug price comparePrice images ratings brand isFeatured");
    sendSuccess(res, 200, "Featured products fetched.", products);
  } catch (error) {
    next(error);
  }
};

// ─── Create Product (Admin) ────────────────────────────────────────────────
export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      comparePrice,
      category,
      brand,
      stock,
      sku,
      tags,
      isFeatured,
      isDigital,
      weight,
      variants,
    } = req.body;

    // Upload all images to Cloudinary in parallel
    const images = [];
    if (req.files?.length) {
      const uploads = await Promise.all(
        req.files.map((f) => uploadImage(f.buffer, "shopsphere/products")),
      );
      images.push(...uploads);
    }

    const product = await Product.create({
      name,
      description,
      price,
      comparePrice,
      category,
      brand,
      stock,
      sku,
      tags: tags ? JSON.parse(tags) : [],
      isFeatured: isFeatured === "true",
      isDigital: isDigital === "true",
      weight: Number(weight) || 0,
      variants: variants ? JSON.parse(variants) : [],
      images,
    });

    await product.populate("category", "name slug");
    sendSuccess(res, 201, "Product created.", product);
  } catch (error) {
    next(error);
  }
};

// ─── Update Product (Admin) ────────────────────────────────────────────────
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) throw new AppError("Product not found.", 404);

    const fields = [
      "name",
      "description",
      "price",
      "comparePrice",
      "category",
      "brand",
      "stock",
      "sku",
      "isFeatured",
      "isActive",
      "isDigital",
      "weight",
    ];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) product[f] = req.body[f];
    });

    if (req.body.tags) product.tags = JSON.parse(req.body.tags);
    if (req.body.variants) product.variants = JSON.parse(req.body.variants);

    // Upload new images and append
    if (req.files?.length) {
      const uploads = await Promise.all(
        req.files.map((f) => uploadImage(f.buffer, "shopsphere/products")),
      );
      product.images.push(...uploads);
    }

    await product.save();
    await product.populate("category", "name slug");
    sendSuccess(res, 200, "Product updated.", product);
  } catch (error) {
    next(error);
  }
};

// ─── Delete Product Image (Admin) ─────────────────────────────────────────
export const deleteProductImage = async (req, res, next) => {
  try {
    const { id, publicId } = req.params;
    const product = await Product.findById(id);
    if (!product) throw new AppError("Product not found.", 404);

    await deleteImage(decodeURIComponent(publicId));
    product.images = product.images.filter(
      (img) => img.publicId !== decodeURIComponent(publicId),
    );
    await product.save();

    sendSuccess(res, 200, "Image deleted.", product.images);
  } catch (error) {
    next(error);
  }
};

// ─── Delete Product (Admin) ────────────────────────────────────────────────
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) throw new AppError("Product not found.", 404);
    product.isActive = false; // Soft delete
    await product.save();
    sendSuccess(res, 200, "Product deleted.");
  } catch (error) {
    next(error);
  }
};
