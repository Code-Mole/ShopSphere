import { useState, useEffect, useCallback } from "react";
import { adminService } from "../../services/admin.service.js";
import DataTable from "../../components/admin/DataTable.jsx";
import Pagination from "../../components/admin/Pagination.jsx";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminService.getCustomers({ page, keyword });
      setCustomers(data.data);
      setMeta(data.meta);
    } finally {
      setLoading(false);
    }
  }, [page, keyword]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const toggleStatus = async (id) => {
    await adminService.toggleCustomerStatus(id);
    fetchCustomers();
  };

  const columns = [
    {
      key: "name",
      label: "Customer",
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-700 font-semibold text-xs">
              {c.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{c.name}</p>
            <p className="text-xs text-gray-400">{c.email}</p>
          </div>
        </div>
      ),
    },
    { key: "orderCount", label: "Orders", render: (c) => c.orderCount },
    {
      key: "totalSpent",
      label: "Total Spent",
      render: (c) => `GH₵${c.totalSpent.toLocaleString()}`,
    },
    {
      key: "isEmailVerified",
      label: "Verified",
      render: (c) =>
        c.isEmailVerified ? (
          <span className="badge bg-green-100 text-green-700">Verified</span>
        ) : (
          <span className="badge bg-gray-100 text-gray-500">Unverified</span>
        ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (c) => (
        <button
          onClick={() => toggleStatus(c._id)}
          className={`badge cursor-pointer ${c.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
        >
          {c.isActive ? "Active" : "Deactivated"}
        </button>
      ),
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (c) =>
        new Date(c.createdAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Customers</h1>

      <div className="card p-4 mb-4">
        <input
          placeholder="Search by name or email…"
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
          data={customers}
          loading={loading}
          emptyMessage="No customers found."
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
