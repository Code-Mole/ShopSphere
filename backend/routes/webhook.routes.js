import { Router } from "express";
import express from "express";
import { handleWebhook } from "../controllers/order.controller.js";
import { verifyPaystackSignature } from "../utils/crypto.js";
import { sendError } from "../utils/ApiResponse.js";

const router = Router();

router.post(
  "/paystack",
  express.raw({ type: "application/json" }), // capture raw buffer for signature check
  (req, res, next) => {
    const signature = req.headers["x-paystack-signature"];
    if (!signature || !verifyPaystackSignature(req.body, signature)) {
      return sendError(res, 401, "Invalid webhook signature.");
    }
    next();
  },
  handleWebhook,
);

export default router;
