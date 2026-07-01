import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { adminService } from "../../services/admin.service.js";
import DataTable from "../../components/admin/DataTable.jsx";
import Pagination from "../../components/admin/Pagination.jsx";

const STATUS_OPTIONS = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];
const STATUS_STYLES = {
  pending: "bg-gray-100 text-gray-600",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-amber-100 text-amber-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [keyword, setKeyword] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminService.getOrders({ page, status, keyword });
      setOrders(data.data);
      setMeta(data.meta);
    } finally {
      setLoading(false);
    }
  }, [page, status, keyword]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (id, newStatus) => {
    await adminService.updateOrderStatus(id, newStatus);
    fetchOrders();
  };

  const columns = [
    {
      key: "orderNumber",
      label: "Order",
      render: (o) => (
        <Link
          to={`/admin/orders/${o._id}`}
          className="font-medium text-gray-900 hover:text-primary-600"
        >
          {o.orderNumber}
        </Link>
      ),
    },
    {
      key: "user",
      label: "Customer",
      render: (o) => (
        <div>
          <p className="text-gray-900">{o.user?.name}</p>
          <p className="text-xs text-gray-400">{o.user?.email}</p>
        </div>
      ),
    },
    {
      key: "total",
      label: "Total",
      render: (o) => `GH₵${o.pricing.total.toLocaleString()}`,
    },
    {
      key: "paymentStatus",
      label: "Payment",
      render: (o) => (
        <span
          className={`badge ${o.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
        >
          {o.paymentStatus}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (o) => (
        <select
          value={o.status}
          onChange={(e) => handleStatusChange(o._id, e.target.value)}
          className={`${STATUS_STYLES[o.status]} text-xs font-medium rounded-full px-2.5 py-1 border-0 cursor-pointer`}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (o) =>
        new Date(o.createdAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        }),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>

      <div className="card p-4 mb-4 flex flex-wrap gap-3">
        <input
          placeholder="Search order # or customer…"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setPage(1);
          }}
          className="input text-sm max-w-sm"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="input text-sm w-auto"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="card p-4">
        <DataTable
          columns={columns}
          data={orders}
          loading={loading}
          emptyMessage="No orders found."
        />
        {meta && (
          <Pagination
            page={page}
            totalPages={meta.totalPages}
            onChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
