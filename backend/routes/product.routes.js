import { Router } from "express";
import {
  getProducts,
  getProduct,
  getRelatedProducts,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
} from "../controllers/product.controller.js";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { productValidator } from "../validators/product.validator.js";
import { upload } from "../middleware/upload.js";

const router = Router();

// Public
router.get("/", getProducts);
router.get("/featured", getFeaturedProducts);
router.get("/:slug", getProduct);
router.get("/:id/related", getRelatedProducts);

// Admin only
router.post(
  "/",
  protect,
  authorize("admin"),
  upload.array("images", 5),
  productValidator,
  validate,
  createProduct,
);
router.put(
  "/:id",
  protect,
  authorize("admin"),
  upload.array("images", 5),
  updateProduct,
);
router.delete(
  "/:id/images/:publicId",
  protect,
  authorize("admin"),
  deleteProductImage,
);
router.delete("/:id", protect, authorize("admin"), deleteProduct);

export default router;
