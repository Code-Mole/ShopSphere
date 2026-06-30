import { Router } from "express";
import {
  initiateCheckout,
  verifyPayment,
  getMyOrders,
  getOrder,
  cancelOrder,
} from "../controllers/order.controller.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { checkoutValidator } from "../validators/order.validator.js";

const router = Router();

router.use(protect); // All order routes require auth

router.post("/checkout", checkoutValidator, validate, initiateCheckout);
router.get("/verify/:reference", verifyPayment);
router.get("/", getMyOrders);
router.get("/:id", getOrder);
router.put("/:id/cancel", cancelOrder);

export default router;
