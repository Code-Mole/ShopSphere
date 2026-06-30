import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";
import { sendSuccess, AppError } from "../utils/ApiResponse.js";

// ─── Get Wishlist ──────────────────────────────────────────────────────────
export const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
      "products",
      "name slug price comparePrice images ratings brand stock",
    );

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }
    sendSuccess(res, 200, "Wishlist fetched.", wishlist);
  } catch (error) {
    next(error);
  }
};

// ─── Toggle Product in Wishlist ────────────────────────────────────────────
export const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) throw new AppError("Product not found.", 404);

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    const idx = wishlist.products.indexOf(productId);
    let action;

    if (idx > -1) {
      wishlist.products.splice(idx, 1); // Remove
      action = "removed";
    } else {
      wishlist.products.push(productId); // Add
      action = "added";
    }

    await wishlist.save();
    sendSuccess(
      res,
      200,
      `Product ${action} ${action === "added" ? "to" : "from"} wishlist.`,
      {
        wishlist,
        action,
      },
    );
  } catch (error) {
    next(error);
  }
};

// ─── Remove Product from Wishlist ──────────────────────────────────────────
export const removeFromWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) throw new AppError("Wishlist not found.", 404);

    wishlist.products = wishlist.products.filter(
      (p) => p.toString() !== req.params.productId,
    );
    await wishlist.save();
    sendSuccess(res, 200, "Removed from wishlist.", wishlist);
  } catch (error) {
    next(error);
  }
};
