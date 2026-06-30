import { Router } from "express";
import {
  validateCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../controllers/coupon.controller.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.post("/validate", protect, validateCoupon);

// Admin only
router.get("/", protect, authorize("admin"), getCoupons);
router.post("/", protect, authorize("admin"), createCoupon);
router.put("/:id", protect, authorize("admin"), updateCoupon);
router.delete("/:id", protect, authorize("admin"), deleteCoupon);

export default router;
