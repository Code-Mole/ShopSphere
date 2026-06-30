import api from "./api.js";

export const orderService = {
  checkout: (data) => api.post("/orders/checkout", data),
  verifyPayment: (reference) => api.get(`/orders/verify/${reference}`),
  getMyOrders: (params) => api.get("/orders", { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
  validateCoupon: (code, subtotal) =>
    api.post("/coupons/validate", { code, subtotal }),
};

export const addressService = {
  getAddresses: () => api.get("/addresses"),
  createAddress: (data) => api.post("/addresses", data),
  updateAddress: (id, data) => api.put(`/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/addresses/${id}`),
};
