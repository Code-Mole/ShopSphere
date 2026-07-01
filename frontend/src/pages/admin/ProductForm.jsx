import { useState, useEffect } from "react";
import { adminService } from "../../services/admin.service.js";
import Spinner from "../../components/ui/Spinner.jsx";
import Alert from "../../components/ui/Alert.jsx";

export default function ProductForm({ product, onSuccess, onCancel }) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || "",
    comparePrice: product?.comparePrice || "",
    category: product?.category?._id || "",
    brand: product?.brand || "",
    stock: product?.stock ?? "",
    sku: product?.sku || "",
    tags: product?.tags?.join(", ") || "",
    isFeatured: product?.isFeatured || false,
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState(product?.images || []);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  useEffect(() => {
    adminService.getCategories().then(({ data }) => setCategories(data.data));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    setImageFiles(Array.from(e.target.files).slice(0, 5));
  };

  const removeExistingImage = async (publicId) => {
    if (!product) return;
    try {
      await adminService.deleteProductImage(product._id, publicId);
      setExistingImages((prev) =>
        prev.filter((img) => img.publicId !== publicId),
      );
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ type: "", message: "" });

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "tags") {
        formData.append(
          "tags",
          JSON.stringify(
            value
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
          ),
        );
      } else {
        formData.append(key, value);
      }
    });
    imageFiles.forEach((file) => formData.append("images", file));

    try {
      if (product) {
        await adminService.updateProduct(product._id, formData);
        setAlert({ type: "success", message: "Product updated!" });
      } else {
        await adminService.createProduct(formData);
        setAlert({ type: "success", message: "Product created!" });
      }
      setTimeout(() => onSuccess(), 800);
    } catch (err) {
      setAlert({
        type: "error",
        message: err.response?.data?.message || "Failed to save product.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Alert type={alert.type} message={alert.message} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Product Name *
        </label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="input"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Description *
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          rows={4}
          className="input resize-none"
          maxLength={2000}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Price (GH₵) *
          </label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Compare Price
          </label>
          <input
            type="number"
            name="comparePrice"
            value={form.comparePrice}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="input"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Category *
          </label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="input"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Brand
          </label>
          <input
            name="brand"
            value={form.brand}
            onChange={handleChange}
            className="input"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Stock *
          </label>
          <input
            type="number"
            name="stock"
            value={form.stock}
            onChange={handleChange}
            required
            min="0"
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            SKU
          </label>
          <input
            name="sku"
            value={form.sku}
            onChange={handleChange}
            className="input"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Tags (comma separated)
        </label>
        <input
          name="tags"
          value={form.tags}
          onChange={handleChange}
          placeholder="electronics, gift, trending"
          className="input"
        />
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isFeatured"
          checked={form.isFeatured}
          onChange={handleChange}
          className="w-4 h-4 rounded border-gray-300 text-primary-600"
        />
        <span className="text-sm text-gray-700">Mark as Featured</span>
      </label>

      {/* Existing images */}
      {existingImages.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Images
          </label>
          <div className="flex gap-2 flex-wrap">
            {existingImages.map((img) => (
              <div key={img.publicId} className="relative">
                <img
                  src={img.url}
                  alt=""
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(img.publicId)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {product ? "Add More Images" : "Product Images (max 5)"}
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="input"
        />
        {imageFiles.length > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            {imageFiles.length} file(s) selected
          </p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? (
            <Spinner size="sm" color="white" />
          ) : product ? (
            "Update Product"
          ) : (
            "Create Product"
          )}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
