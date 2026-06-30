import { Router } from "express";
import authRoutes from "./auth.routes.js";
import categoryRoutes from "./category.routes.js";
import productRoutes from "./product.routes.js";
import reviewRoutes from "./review.routes.js";
import cartRoutes from "./cart.routes.js";
import wishlistRoutes from "./wishlist.routes.js";
import orderRoutes from "./order.routes.js";
import couponRoutes from "./coupon.routes.js";
import addressRoutes from "./address.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/products/:productId/reviews", reviewRoutes);
router.use("/cart", cartRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/orders", orderRoutes);
router.use("/coupons", couponRoutes);
router.use("/addresses", addressRoutes);

export default router;
