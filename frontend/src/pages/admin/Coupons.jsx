import { useState, useEffect } from "react";
import { adminService } from "../../services/admin.service.js";
import DataTable from "../../components/admin/DataTable.jsx";
import Modal from "../../components/admin/Modal.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import Alert from "../../components/ui/Alert.jsx";

const EMPTY_FORM = {
  code: "",
  discountType: "percentage",
  discountValue: "",
  minOrderAmount: "",
  maxDiscountAmount: "",
  usageLimit: "",
  expiresAt: "",
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, coupon: null });
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await adminService.getCoupons();
      setCoupons(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openModal = (coupon = null) => {
    setForm(
      coupon
        ? {
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            minOrderAmount: coupon.minOrderAmount,
            maxDiscountAmount: coupon.maxDiscountAmount || "",
            usageLimit: coupon.usageLimit || "",
            expiresAt: coupon.expiresAt.slice(0, 10),
          }
        : EMPTY_FORM,
    );
    setAlert({ type: "", message: "" });
    setModal({ open: true, coupon });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      ...form,
      discountValue: Number(form.discountValue),
      minOrderAmount: Number(form.minOrderAmount) || 0,
      maxDiscountAmount: form.maxDiscountAmount
        ? Number(form.maxDiscountAmount)
        : null,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
    };

    try {
      if (modal.coupon)
        await adminService.updateCoupon(modal.coupon._id, payload);
      else await adminService.createCoupon(payload);
      setModal({ open: false, coupon: null });
      fetchCoupons();
    } catch (err) {
      setAlert({
        type: "error",
        message: err.response?.data?.message || "Failed to save coupon.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    await adminService.deleteCoupon(id);
    fetchCoupons();
  };

  const columns = [
    {
      key: "code",
      label: "Code",
      render: (c) => (
        <span className="font-mono font-semibold text-gray-900">{c.code}</span>
      ),
    },
    {
      key: "discount",
      label: "Discount",
      render: (c) =>
        c.discountType === "percentage"
          ? `${c.discountValue}%`
          : `GH₵${c.discountValue}`,
    },
    {
      key: "usage",
      label: "Usage",
      render: (c) =>
        `${c.usedCount}${c.usageLimit ? ` / ${c.usageLimit}` : ""}`,
    },
    {
      key: "expiresAt",
      label: "Expires",
      render: (c) => {
        const expired = new Date(c.expiresAt) < new Date();
        return (
          <span className={expired ? "text-red-500" : "text-gray-600"}>
            {new Date(c.expiresAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        );
      },
    },
    {
      key: "isActive",
      label: "Status",
      render: (c) => (
        <span
          className={`badge ${c.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
        >
          {c.isActive ? "Active" : "Inactive"}
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
        <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
        <button onClick={() => openModal()} className="btn-primary text-sm">
          + Add Coupon
        </button>
      </div>

      <div className="card p-4">
        <DataTable
          columns={columns}
          data={coupons}
          loading={loading}
          emptyMessage="No coupons created yet."
        />
      </div>

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, coupon: null })}
        title={modal.coupon ? "Edit Coupon" : "Create Coupon"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Alert type={alert.type} message={alert.message} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Coupon Code *
            </label>
            <input
              value={form.code}
              onChange={(e) =>
                setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))
              }
              required
              placeholder="SAVE20"
              className="input font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Discount Type *
              </label>
              <select
                value={form.discountType}
                onChange={(e) =>
                  setForm((p) => ({ ...p, discountType: e.target.value }))
                }
                className="input"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (GH₵)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Discount Value *
              </label>
              <input
                type="number"
                value={form.discountValue}
                onChange={(e) =>
                  setForm((p) => ({ ...p, discountValue: e.target.value }))
                }
                required
                min="0"
                className="input"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Min Order Amount
              </label>
              <input
                type="number"
                value={form.minOrderAmount}
                onChange={(e) =>
                  setForm((p) => ({ ...p, minOrderAmount: e.target.value }))
                }
                min="0"
                className="input"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Max Discount Cap
              </label>
              <input
                type="number"
                value={form.maxDiscountAmount}
                onChange={(e) =>
                  setForm((p) => ({ ...p, maxDiscountAmount: e.target.value }))
                }
                min="0"
                className="input"
                placeholder="No limit"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Usage Limit
              </label>
              <input
                type="number"
                value={form.usageLimit}
                onChange={(e) =>
                  setForm((p) => ({ ...p, usageLimit: e.target.value }))
                }
                min="0"
                className="input"
                placeholder="Unlimited"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Expiry Date *
              </label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) =>
                  setForm((p) => ({ ...p, expiresAt: e.target.value }))
                }
                required
                className="input"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? <Spinner size="sm" color="white" /> : "Save Coupon"}
            </button>
            <button
              type="button"
              onClick={() => setModal({ open: false, coupon: null })}
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
