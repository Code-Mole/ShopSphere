import { Router } from "express";
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { categoryValidator } from "../validators/product.validator.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.get("/", getCategories);
router.get("/:slug", getCategory);

// Admin only
router.post(
  "/",
  protect,
  authorize("admin"),
  upload.single("image"),
  categoryValidator,
  validate,
  createCategory,
);
router.put(
  "/:id",
  protect,
  authorize("admin"),
  upload.single("image"),
  updateCategory,
);
router.delete("/:id", protect, authorize("admin"), deleteCategory);

export default router;
