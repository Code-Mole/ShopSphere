import { Router } from "express";
import {
  getDashboardStats,
  getSalesChart,
  getOrderStatusBreakdown,
  getCustomerGrowth,
} from "../controllers/admin.controller.js";
import {
  getAllOrders,
  updateOrderStatus,
  refundOrder,
} from "../controllers/admin.order.controller.js";
import {
  getCustomers,
  toggleCustomerStatus,
  getCustomerDetail,
} from "../controllers/admin.customer.controller.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

// Every route here is admin-only
router.use(protect, authorize("admin"));

// Dashboard
router.get("/dashboard/stats", getDashboardStats);
router.get("/dashboard/sales-chart", getSalesChart);
router.get("/dashboard/order-status", getOrderStatusBreakdown);
router.get("/dashboard/customer-growth", getCustomerGrowth);

// Orders
router.get("/orders", getAllOrders);
router.put("/orders/:id/status", updateOrderStatus);
router.put("/orders/:id/refund", refundOrder);

// Customers
router.get("/customers", getCustomers);
router.get("/customers/:id", getCustomerDetail);
router.put("/customers/:id/toggle", toggleCustomerStatus);

export default router;
