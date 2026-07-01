import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

// ─── Dashboard Overview Stats ──────────────────────────────────────────────
export const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      pendingOrders,
      monthlyRevenue,
      lastMonthRevenue,
      bestSellers,
    ] = await Promise.all([
      // Total revenue from all paid orders
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$pricing.total" } } },
      ]),

      Order.countDocuments({ paymentStatus: "paid" }),
      User.countDocuments({ role: "customer" }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments({ status: "pending" }),

      // This month's revenue
      Order.aggregate([
        { $match: { paymentStatus: "paid", paidAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$pricing.total" } } },
      ]),

      // Last month's revenue (for % change comparison)
      Order.aggregate([
        {
          $match: {
            paymentStatus: "paid",
            paidAt: { $gte: startOfLastMonth, $lt: startOfMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$pricing.total" } } },
      ]),

      // Best selling products
      Product.find({ isActive: true })
        .sort({ soldCount: -1 })
        .limit(5)
        .select("name slug images soldCount price"),
    ]);

    const thisMonth = monthlyRevenue[0]?.total || 0;
    const lastMonth = lastMonthRevenue[0]?.total || 0;
    const revenueChange =
      lastMonth > 0
        ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100)
        : thisMonth > 0
          ? 100
          : 0;

    res.json({
      success: true,
      message: "Dashboard stats fetched.",
      data: {
        totalRevenue: totalRevenue[0]?.total || 0,
        totalOrders,
        totalCustomers,
        totalProducts,
        pendingOrders,
        monthlyRevenue: thisMonth,
        revenueChange,
        bestSellers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Sales Chart Data (last 12 months) ─────────────────────────────────────
export const getSalesChart = async (req, res, next) => {
  try {
    const months = Number(req.query.months) || 6;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months + 1);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const data = await Order.aggregate([
      { $match: { paymentStatus: "paid", paidAt: { $gte: startDate } } },
      {
        $group: {
          _id: { year: { $year: "$paidAt" }, month: { $month: "$paidAt" } },
          revenue: { $sum: "$pricing.total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Fill in months with zero data so the chart has no gaps
    const result = [];
    const cursor = new Date(startDate);
    for (let i = 0; i < months; i++) {
      const year = cursor.getFullYear();
      const month = cursor.getMonth() + 1;
      const found = data.find(
        (d) => d._id.year === year && d._id.month === month,
      );
      result.push({
        label: cursor.toLocaleDateString("en-US", { month: "short" }),
        revenue: found?.revenue || 0,
        orders: found?.orders || 0,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }

    res.json({ success: true, message: "Sales chart fetched.", data: result });
  } catch (error) {
    next(error);
  }
};

// ─── Order Status Breakdown (for pie/donut chart) ──────────────────────────
export const getOrderStatusBreakdown = async (req, res, next) => {
  try {
    const data = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    res.json({
      success: true,
      message: "Order status breakdown fetched.",
      data: data.map((d) => ({ status: d._id, count: d.count })),
    });
  } catch (error) {
    next(error);
  }
};

// ─── Customer Growth Chart ─────────────────────────────────────────────────
export const getCustomerGrowth = async (req, res, next) => {
  try {
    const months = Number(req.query.months) || 6;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months + 1);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const data = await User.aggregate([
      { $match: { role: "customer", createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const result = [];
    const cursor = new Date(startDate);
    for (let i = 0; i < months; i++) {
      const year = cursor.getFullYear();
      const month = cursor.getMonth() + 1;
      const found = data.find(
        (d) => d._id.year === year && d._id.month === month,
      );
      result.push({
        label: cursor.toLocaleDateString("en-US", { month: "short" }),
        customers: found?.count || 0,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }

    res.json({
      success: true,
      message: "Customer growth fetched.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
