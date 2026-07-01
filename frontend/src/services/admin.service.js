import api from "./api.js";

export const adminService = {
  // Dashboard
  getStats: () => api.get("/admin/dashboard/stats"),
  getSalesChart: (months = 6) =>
    api.get("/admin/dashboard/sales-chart", { params: { months } }),
  getOrderStatus: () => api.get("/admin/dashboard/order-status"),
  getCustomerGrowth: (months = 6) =>
    api.get("/admin/dashboard/customer-growth", { params: { months } }),

  // Products
  getProducts: (params) =>
    api.get("/products", { params: { ...params, limit: 50 } }),
  createProduct: (formData) =>
    api.post("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateProduct: (id, formData) =>
    api.put(`/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  deleteProductImage: (id, publicId) =>
    api.delete(`/products/${id}/images/${encodeURIComponent(publicId)}`),

  // Categories
  getCategories: () => api.get("/categories"),
  createCategory: (formData) =>
    api.post("/categories", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateCategory: (id, formData) =>
    api.put(`/categories/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteCategory: (id) => api.delete(`/categories/${id}`),

  // Orders
  getOrders: (params) => api.get("/admin/orders", { params }),
  updateOrderStatus: (id, status) =>
    api.put(`/admin/orders/${id}/status`, { status }),
  refundOrder: (id, reason) =>
    api.put(`/admin/orders/${id}/refund`, { reason }),

  // Customers
  getCustomers: (params) => api.get("/admin/customers", { params }),
  getCustomerDetail: (id) => api.get(`/admin/customers/${id}`),
  toggleCustomerStatus: (id) => api.put(`/admin/customers/${id}/toggle`),

  // Coupons
  getCoupons: () => api.get("/coupons"),
  createCoupon: (data) => api.post("/coupons", data),
  updateCoupon: (id, data) => api.put(`/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/coupons/${id}`),
};
