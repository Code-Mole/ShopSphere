import api from "./api.js";

export const reviewService = {
  getReviews: (productId, params) =>
    api.get(`/products/${productId}/reviews`, { params }),
  getMyReview: (productId) =>
    api.get(`/products/${productId}/reviews/my-review`),
  createReview: (productId, data) =>
    api.post(`/products/${productId}/reviews`, data),
  updateReview: (productId, reviewId, data) =>
    api.put(`/products/${productId}/reviews/${reviewId}`, data),
  deleteReview: (productId, reviewId) =>
    api.delete(`/products/${productId}/reviews/${reviewId}`),
};
