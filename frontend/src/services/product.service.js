import api from "./api.js";

export const productService = {
  getProducts: (params) => api.get("/products", { params }),

  getProduct: (slug) => api.get(`/products/${slug}`),

  getFeatured: () => api.get("/products/featured"),

  getRelated: (id) => api.get(`/products/${id}/related`),

  getCategories: () => api.get("/categories"),

  // Admin
  createProduct: (formData) =>
    api.post("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  updateProduct: (id, formData) =>
    api.put(`/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  deleteProduct: (id) => api.delete(`/products/${id}`),
};
