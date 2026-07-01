import Order   from '../models/Order.js';
import Product from '../models/Product.js';
import { sendSuccess, sendError, AppError } from '../utils/ApiResponse.js';

// ─── Get All Orders (Admin) — with filters ─────────────────────────────────
export const getAllOrders = async (req, res, next) => {
  try {
    const {
      status, paymentStatus, keyword,
      page = 1, limit = 15, sort = '-createdAt',
    } = req.query;

    const filter = {};
    if (status)        filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (keyword) {
      filter.$or = [
        { orderNumber: { $regex: keyword, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: keyword, $options: 'i' } },
      ];
    }

    const pageNum  = Math.max(1, Number(page));
    const limitNum = Math.min(50, Number(limit));

    const sortMap = { '-createdAt': { createdAt: -1 }, 'createdAt': { createdAt: 1 } };

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email')
        .sort(sortMap[sort] || { createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Order.countDocuments(filter),
    ]);

    sendSuccess(res, 200, 'Orders fetched.', orders, {
      total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) { next(error); }
};

// ─── Update Order Status (Admin) ───────────────────────────────────────────
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return sendError(res, 400, 'Invalid order status.');
    }

    const order = await Order.findById(req.params.id);
    if (!order) throw new AppError('Order not found.', 404);

    // If cancelling a previously paid order, restock items
    if (status === 'cancelled' && order.status !== 'cancelled' && order.paymentStatus === 'paid') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity, soldCount: -item.quantity },
        });
      }
      order.cancelledAt = new Date();
    }

    if (status === 'delivered') order.deliveredAt = new Date();

    order.status = status;
    await order.save();

    sendSuccess(res, 200, 'Order status updated.', order);
  } catch (error) { next(error); }
};

// ─── Process Refund (Admin) — marks refunded, restocks items ──────────────
export const refundOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw new AppError('Order not found.', 404);

    if (order.paymentStatus !== 'paid') {
      return sendError(res, 400, 'Only paid orders can be refunded.');
    }

    // Note: actual Paystack refund API call would go here in production.
    // For this academic project, we record the refund status internally.
    order.paymentStatus = 'refunded';
    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancelReason = req.body.reason || 'Refunded by admin';
    await order.save();

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, soldCount: -item.quantity },
      });
    }

    sendSuccess(res, 200, 'Order refunded successfully.', order);
  } catch (error) { next(error); }
};