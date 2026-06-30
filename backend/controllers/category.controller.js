import Category from "../models/Category.js";
import { sendSuccess, sendError, AppError } from "../utils/ApiResponse.js";
import { uploadImage, deleteImage } from "../services/cloudinary.service.js";

// ─── Get All Categories ────────────────────────────────────────────────────
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({
      name: 1,
    });
    sendSuccess(res, 200, "Categories fetched.", categories);
  } catch (error) {
    next(error);
  }
};

// ─── Get Single Category ───────────────────────────────────────────────────
export const getCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      slug: req.params.slug,
      isActive: true,
    });
    if (!category) throw new AppError("Category not found.", 404);
    sendSuccess(res, 200, "Category fetched.", category);
  } catch (error) {
    next(error);
  }
};

// ─── Create Category (Admin) ───────────────────────────────────────────────
export const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    let image = "";

    if (req.file) {
      const result = await uploadImage(
        req.file.buffer,
        "shopsphere/categories",
      );
      image = result.url;
    }

    const category = await Category.create({ name, description, image });
    sendSuccess(res, 201, "Category created.", category);
  } catch (error) {
    next(error);
  }
};

// ─── Update Category (Admin) ───────────────────────────────────────────────
export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) throw new AppError("Category not found.", 404);

    const { name, description, isActive } = req.body;
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (isActive !== undefined) category.isActive = isActive;

    if (req.file) {
      const result = await uploadImage(
        req.file.buffer,
        "shopsphere/categories",
      );
      category.image = result.url;
    }

    await category.save();
    sendSuccess(res, 200, "Category updated.", category);
  } catch (error) {
    next(error);
  }
};

// ─── Delete Category (Admin) ───────────────────────────────────────────────
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) throw new AppError("Category not found.", 404);
    // Soft delete — keeps historical data intact
    category.isActive = false;
    await category.save();
    sendSuccess(res, 200, "Category deleted.");
  } catch (error) {
    next(error);
  }
};
