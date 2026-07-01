import { useState, useEffect } from "react";
import { adminService } from "../../services/admin.service.js";
import DataTable from "../../components/admin/DataTable.jsx";
import Modal from "../../components/admin/Modal.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import Alert from "../../components/ui/Alert.jsx";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, category: null });
  const [form, setForm] = useState({ name: "", description: "" });
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await adminService.getCategories();
      setCategories(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openModal = (category = null) => {
    setForm({
      name: category?.name || "",
      description: category?.description || "",
    });
    setImageFile(null);
    setAlert({ type: "", message: "" });
    setModal({ open: true, category });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    if (imageFile) formData.append("image", imageFile);

    try {
      if (modal.category) {
        await adminService.updateCategory(modal.category._id, formData);
      } else {
        await adminService.createCategory(formData);
      }
      setModal({ open: false, category: null });
      fetchCategories();
    } catch (err) {
      setAlert({
        type: "error",
        message: err.response?.data?.message || "Failed to save category.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    await adminService.deleteCategory(id);
    fetchCategories();
  };

  const columns = [
    {
      key: "name",
      label: "Category",
      render: (c) => (
        <div className="flex items-center gap-3">
          <img
            src={c.image || "https://placehold.co/40x40?text=?"}
            alt=""
            className="w-10 h-10 rounded-lg object-cover bg-gray-50"
          />
          <span className="font-medium text-gray-900">{c.name}</span>
        </div>
      ),
    },
    { key: "slug", label: "Slug" },
    {
      key: "description",
      label: "Description",
      render: (c) => (
        <span className="text-gray-500 max-w-xs truncate block">
          {c.description || "—"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (c) => (
        <div className="flex gap-2">
          <button
            onClick={() => openModal(c)}
            className="text-xs text-primary-600 hover:underline"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(c._id)}
            className="text-xs text-red-500 hover:underline"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button onClick={() => openModal()} className="btn-primary text-sm">
          + Add Category
        </button>
      </div>

      <div className="card p-4">
        <DataTable
          columns={columns}
          data={categories}
          loading={loading}
          emptyMessage="No categories yet."
        />
      </div>

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, category: null })}
        title={modal.category ? "Edit Category" : "Add Category"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Alert type={alert.type} message={alert.message} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Name *
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              rows={3}
              maxLength={200}
              className="input resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="input"
            />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? (
                <Spinner size="sm" color="white" />
              ) : (
                "Save Category"
              )}
            </button>
            <button
              type="button"
              onClick={() => setModal({ open: false, category: null })}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
