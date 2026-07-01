import User from "../models/User.js";
import Order from "../models/Order.js";
import { sendSuccess, sendError, AppError } from "../utils/ApiResponse.js";

// ─── Get All Customers ─────────────────────────────────────────────────────
export const getCustomers = async (req, res, next) => {
  try {
    const { keyword, page = 1, limit = 15 } = req.query;

    const filter = { role: "customer" };
    if (keyword) {
      filter.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Number(limit));

    const [customers, total] = await Promise.all([
      User.find(filter)
        .select("name email phone isActive isEmailVerified createdAt lastLogin")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      User.countDocuments(filter),
    ]);

    // Attach order count + total spent for each customer
    const customersWithStats = await Promise.all(
      customers.map(async (c) => {
        const stats = await Order.aggregate([
          { $match: { user: c._id, paymentStatus: "paid" } },
          {
            $group: {
              _id: null,
              totalSpent: { $sum: "$pricing.total" },
              orderCount: { $sum: 1 },
            },
          },
        ]);
        return {
          ...c.toObject(),
          totalSpent: stats[0]?.totalSpent || 0,
          orderCount: stats[0]?.orderCount || 0,
        };
      }),
    );

    sendSuccess(res, 200, "Customers fetched.", customersWithStats, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
};

// ─── Toggle Customer Active Status ─────────────────────────────────────────
export const toggleCustomerStatus = async (req, res, next) => {
  try {
    const customer = await User.findOne({
      _id: req.params.id,
      role: "customer",
    });
    if (!customer) throw new AppError("Customer not found.", 404);

    customer.isActive = !customer.isActive;
    await customer.save();

    sendSuccess(
      res,
      200,
      `Customer ${customer.isActive ? "activated" : "deactivated"}.`,
      customer,
    );
  } catch (error) {
    next(error);
  }
};

// ─── Get Single Customer Detail (with order history) ───────────────────────
export const getCustomerDetail = async (req, res, next) => {
  try {
    const customer = await User.findOne({
      _id: req.params.id,
      role: "customer",
    }).select("-password");
    if (!customer) throw new AppError("Customer not found.", 404);

    const orders = await Order.find({ user: customer._id })
      .sort({ createdAt: -1 })
      .limit(10);

    sendSuccess(res, 200, "Customer detail fetched.", { customer, orders });
  } catch (error) {
    next(error);
  }
};
