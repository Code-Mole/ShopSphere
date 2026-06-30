import Coupon from "../models/Coupon.js";
import { sendSuccess, sendError, AppError } from "../utils/ApiResponse.js";

// ─── Validate Coupon (Customer) ────────────────────────────────────────────
export const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) return sendError(res, 404, "Invalid coupon code.");

    const discount = coupon.calculateDiscount(subtotal); // throws if invalid

    sendSuccess(res, 200, "Coupon applied!", {
      code: coupon.code,
      discount,
      discountType: coupon.discountType,
    });
  } catch (error) {
    // calculateDiscount throws plain Error — convert to 400
    sendError(res, 400, error.message);
  }
};

// ─── Admin: CRUD ────────────────────────────────────────────────────────────
export const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    sendSuccess(res, 200, "Coupons fetched.", coupons);
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    sendSuccess(res, 201, "Coupon created.", coupon);
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!coupon) throw new AppError("Coupon not found.", 404);
    sendSuccess(res, 200, "Coupon updated.", coupon);
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) throw new AppError("Coupon not found.", 404);
    sendSuccess(res, 200, "Coupon deleted.");
  } catch (error) {
    next(error);
  }
};
