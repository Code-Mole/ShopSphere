import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import { sendSuccess, sendError, AppError } from "../utils/ApiResponse.js";
import {
  initializeTransaction,
  verifyTransaction,
  mapPaymentMethod,
} from "../services/paystack.service.js";
import { generateReference } from "../utils/crypto.js";
import {
  sendOrderConfirmationEmail,
  sendPaymentConfirmationEmail,
} from "../services/email.service.js";

const SHIPPING_FEES = { standard: 15, express: 35 }; // GHS — flat rates for this project's scope

// ─── Initialize Checkout (creates pending order + Paystack transaction) ────
export const initiateCheckout = async (req, res, next) => {
  try {
    const {
      shippingAddress,
      deliveryOption = "standard",
      couponCode,
    } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
    );
    if (!cart || cart.items.length === 0) {
      return sendError(res, 400, "Your cart is empty.");
    }

    // ─── Validate stock for every item before proceeding ──────────────────
    for (const item of cart.items) {
      if (!item.product || !item.product.isActive) {
        return sendError(
          res,
          400,
          `${item.product?.name || "A product"} is no longer available.`,
        );
      }
      if (item.product.stock < item.quantity) {
        return sendError(
          res,
          400,
          `Only ${item.product.stock} of ${item.product.name} left in stock.`,
        );
      }
    }

    const subtotal = cart.items.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0,
    );
    const shippingFee = SHIPPING_FEES[deliveryOption] ?? SHIPPING_FEES.standard;

    // ─── Apply coupon if provided ──────────────────────────────────────────
    let discount = 0;
    let couponData = { code: "", discount: 0 };
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (!coupon) return sendError(res, 400, "Invalid coupon code.");
      try {
        discount = coupon.calculateDiscount(subtotal);
        couponData = { code: coupon.code, discount };
      } catch (err) {
        return sendError(res, 400, err.message);
      }
    }

    const total = Math.max(0, subtotal + shippingFee - discount);

    // ─── Build the order in 'pending' state — NOT paid yet ─────────────────
    const order = await Order.create({
      user: req.user._id,
      items: cart.items.map((item) => ({
        product: item.product._id,
        name: item.product.name,
        image: item.product.images?.[0]?.url || "",
        price: item.price,
        quantity: item.quantity,
        variant: item.variant,
      })),
      shippingAddress,
      deliveryOption,
      coupon: couponData,
      pricing: { subtotal, shippingFee, discount, total },
      paymentStatus: "pending",
      status: "pending",
    });

    // ─── Initialize Paystack transaction ───────────────────────────────────
    const reference = generateReference();
    const paystackData = await initializeTransaction({
      email: req.user.email,
      amount: total,
      reference,
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
      },
    });

    // Create a pending Payment record linked to this order
    await Payment.create({
      order: order._id,
      user: req.user._id,
      reference,
      amount: total,
      status: "pending",
    });

    sendSuccess(res, 201, "Checkout initiated.", {
      order,
      authorizationUrl: paystackData.authorization_url,
      accessCode: paystackData.access_code,
      reference,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Verify Payment (called from frontend after Paystack redirect) ────────
export const verifyPayment = async (req, res, next) => {
  try {
    const { reference } = req.params;

    const payment = await Payment.findOne({ reference }).populate("order");
    if (!payment) return sendError(res, 404, "Payment record not found.");

    // Already processed — idempotent response (handles double-calls/webhook race)
    if (payment.status === "success") {
      return sendSuccess(res, 200, "Payment already verified.", {
        order: payment.order,
      });
    }

    const verification = await verifyTransaction(reference);

    if (verification.status !== "success") {
      payment.status = "failed";
      payment.gatewayResponse = verification;
      await payment.save();

      const order = await Order.findById(payment.order._id);
      order.paymentStatus = "failed";
      await order.save();

      return sendError(res, 400, "Payment was not successful.");
    }

    // ─── Mark payment as successful ────────────────────────────────────────
    payment.status = "success";
    payment.method = mapPaymentMethod(verification.channel);
    payment.gatewayResponse = verification;
    payment.paidAt = new Date();
    await payment.save();

    // ─── Update the order ──────────────────────────────────────────────────
    const order = await Order.findById(payment.order._id).populate(
      "user",
      "name email",
    );
    order.paymentStatus = "paid";
    order.status = "processing";
    order.paidAt = new Date();
    order.paymentMethod = "paystack";
    await order.save();

    // ─── Reduce inventory & increment sold count ───────────────────────────
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, soldCount: item.quantity },
      });
    }

    // ─── Increment coupon usage ────────────────────────────────────────────
    if (order.coupon?.code) {
      await Coupon.findOneAndUpdate(
        { code: order.coupon.code },
        { $inc: { usedCount: 1 } },
      );
    }

    // ─── Clear the user's cart ──────────────────────────────────────────────
    await Cart.findOneAndUpdate({ user: order.user._id }, { items: [] });

    // ─── Send confirmation emails (non-blocking — don't fail the request) ──
    sendOrderConfirmationEmail(order.user, order).catch(console.error);
    sendPaymentConfirmationEmail(order.user, order, payment).catch(
      console.error,
    );

    sendSuccess(res, 200, "Payment verified successfully!", { order });
  } catch (error) {
    next(error);
  }
};

// ─── Paystack Webhook (server-to-server, the real source of truth) ────────
export const handleWebhook = async (req, res, next) => {
  try {
    // req.body here is the raw Buffer — see route setup below
    const event = JSON.parse(req.body.toString());

    if (event.event === "charge.success") {
      const reference = event.data.reference;
      const payment = await Payment.findOne({ reference });

      // Only process if we haven't already marked this as successful
      if (payment && payment.status !== "success") {
        payment.status = "success";
        payment.method = mapPaymentMethod(event.data.channel);
        payment.gatewayResponse = event.data;
        payment.paidAt = new Date();
        await payment.save();

        const order = await Order.findById(payment.order).populate(
          "user",
          "name email",
        );
        if (order && order.paymentStatus !== "paid") {
          order.paymentStatus = "paid";
          order.status = "processing";
          order.paidAt = new Date();
          await order.save();

          for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { stock: -item.quantity, soldCount: item.quantity },
            });
          }
          if (order.coupon?.code) {
            await Coupon.findOneAndUpdate(
              { code: order.coupon.code },
              { $inc: { usedCount: 1 } },
            );
          }
          await Cart.findOneAndUpdate({ user: order.user._id }, { items: [] });

          sendOrderConfirmationEmail(order.user, order).catch(console.error);
        }
      }
    }

    // Always return 200 quickly — Paystack retries on non-200 responses
    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook error:", error);
    res.sendStatus(200); // Still acknowledge — log internally instead
  }
};

// ─── Get My Orders ──────────────────────────────────────────────────────────
export const getMyOrders = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(20, Number(req.query.limit) || 10);

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Order.countDocuments({ user: req.user._id }),
    ]);

    sendSuccess(res, 200, "Orders fetched.", orders, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Single Order ───────────────────────────────────────────────────────
export const getOrder = async (req, res, next) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user.role !== "admin") filter.user = req.user._id;

    const order = await Order.findOne(filter).populate("user", "name email");
    if (!order) throw new AppError("Order not found.", 404);

    sendSuccess(res, 200, "Order fetched.", order);
  } catch (error) {
    next(error);
  }
};

// ─── Cancel Order (Customer — only before processing) ──────────────────────
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!order) throw new AppError("Order not found.", 404);

    if (!["pending", "processing"].includes(order.status)) {
      return sendError(res, 400, "This order can no longer be cancelled.");
    }

    order.status = "cancelled";
    order.cancelledAt = new Date();
    order.cancelReason = req.body.reason || "Cancelled by customer";
    await order.save();

    // Restock items if payment had gone through
    if (order.paymentStatus === "paid") {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity, soldCount: -item.quantity },
        });
      }
    }

    sendSuccess(res, 200, "Order cancelled.", order);
  } catch (error) {
    next(error);
  }
};
