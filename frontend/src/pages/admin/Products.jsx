import { useState, useEffect, useCallback } from "react";
import { adminService } from "../../services/admin.service.js";
import DataTable from "../../components/admin/DataTable.jsx";
import Pagination from "../../components/admin/Pagination.jsx";
import Modal from "../../components/admin/Modal.jsx";
import ProductForm from "./ProductForm.jsx";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [modal, setModal] = useState({ open: false, product: null });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminService.getProducts({ keyword, page });
      setProducts(data.data);
      setMeta(data.meta);
    } finally {
      setLoading(false);
    }
  }, [keyword, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await adminService.deleteProduct(id);
    fetchProducts();
  };

  const columns = [
    {
      key: "name",
      label: "Product",
      render: (p) => (
        <div className="flex items-center gap-3">
          <img
            src={p.images?.[0]?.url || "https://placehold.co/40x40?text=?"}
            alt=""
            className="w-10 h-10 rounded-lg object-cover bg-gray-50"
          />
          <div>
            <p className="font-medium text-gray-900 max-w-[200px] truncate">
              {p.name}
            </p>
            <p className="text-xs text-gray-400">{p.brand}</p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (p) => p.category?.name || "—",
    },
    {
      key: "price",
      label: "Price",
      render: (p) => `GH₵${p.price.toLocaleString()}`,
    },
    {
      key: "stock",
      label: "Stock",
      render: (p) => (
        <span
          className={`badge ${p.stock === 0 ? "bg-red-100 text-red-700" : p.stock < 10 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}
        >
          {p.stock}
        </span>
      ),
    },
    { key: "soldCount", label: "Sold", render: (p) => p.soldCount },
    {
      key: "isFeatured",
      label: "Featured",
      render: (p) =>
        p.isFeatured ? (
          <span className="badge bg-primary-50 text-primary-600">Yes</span>
        ) : (
          <span className="text-gray-300">—</span>
        ),
    },
    {
      key: "actions",
      label: "",
      render: (p) => (
        <div className="flex gap-2">
          <button
            onClick={() => setModal({ open: true, product: p })}
            className="text-xs text-primary-600 hover:underline"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(p._id)}
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
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button
          onClick={() => setModal({ open: true, product: null })}
          className="btn-primary text-sm"
        >
          + Add Product
        </button>
      </div>

      <div className="card p-4 mb-4">
        <input
          placeholder="Search products…"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setPage(1);
          }}
          className="input text-sm max-w-sm"
        />
      </div>

      <div className="card p-4">
        <DataTable
          columns={columns}
          data={products}
          loading={loading}
          emptyMessage="No products found."
        />
        {meta && (
          <Pagination
            page={page}
            totalPages={meta.totalPages}
            onChange={setPage}
          />
        )}
      </div>

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, product: null })}
        title={modal.product ? "Edit Product" : "Add New Product"}
        size="lg"
      >
        <ProductForm
          product={modal.product}
          onSuccess={() => {
            setModal({ open: false, product: null });
            fetchProducts();
          }}
          onCancel={() => setModal({ open: false, product: null })}
        />
      </Modal>
    </div>
  );
}
