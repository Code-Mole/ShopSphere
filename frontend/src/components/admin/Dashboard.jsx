import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminService } from "../../services/admin.service.js";
import StatCard from "../../components/admin/StatCard.jsx";
import Spinner from "../../components/ui/Spinner.jsx";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminService.getStats(),
      adminService.getSalesChart(6),
      adminService.getOrderStatus(),
    ])
      .then(([statsRes, salesRes, statusRes]) => {
        setStats(statsRes.data.data);
        setSalesData(salesRes.data.data);
        setStatusData(statusRes.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" color="primary" />
      </div>
    );

  const maxRevenue = Math.max(...salesData.map((d) => d.revenue), 1);
  const STATUS_COLORS = {
    pending: "#9ca3af",
    processing: "#3b82f6",
    shipped: "#f59e0b",
    delivered: "#10b981",
    cancelled: "#ef4444",
  };
  const totalStatusCount = statusData.reduce((sum, s) => sum + s.count, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Dashboard Overview
      </h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Revenue"
          prefix="GH₵"
          value={stats.totalRevenue.toLocaleString()}
          change={stats.revenueChange}
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <StatCard
          label="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
        />
        <StatCard
          label="Customers"
          value={stats.totalCustomers.toLocaleString()}
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 10-4-4"
              />
            </svg>
          }
        />
        <StatCard
          label="Pending Orders"
          value={stats.pendingOrders.toLocaleString()}
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart — custom SVG bar chart, no external library needed */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="font-semibold text-gray-900 mb-6">
            Revenue — Last 6 Months
          </h2>
          <div className="flex items-end justify-between gap-3 h-48">
            {salesData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center justify-end h-40 relative group">
                  <div
                    className="w-full max-w-[40px] bg-primary-500 rounded-t-md transition-all duration-500 hover:bg-primary-600"
                    style={{
                      height: `${(d.revenue / maxRevenue) * 100}%`,
                      minHeight: d.revenue > 0 ? "4px" : "0",
                    }}
                  />
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    GH₵{d.revenue.toLocaleString()}
                  </div>
                </div>
                <span className="text-xs text-gray-400">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status Donut */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-6">Order Status</h2>
          <div className="space-y-3">
            {statusData.map((s) => {
              const pct =
                totalStatusCount > 0
                  ? Math.round((s.count / totalStatusCount) * 100)
                  : 0;
              return (
                <div key={s.status}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="capitalize text-gray-600 font-medium">
                      {s.status}
                    </span>
                    <span className="text-gray-400">
                      {s.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: STATUS_COLORS[s.status],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Best Sellers */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900">Best Selling Products</h2>
          <Link
            to="/admin/products"
            className="text-sm text-primary-600 hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="space-y-3">
          {stats.bestSellers.map((p, i) => (
            <div key={p._id} className="flex items-center gap-4">
              <span className="text-sm font-bold text-gray-300 w-5">
                {i + 1}
              </span>
              <img
                src={p.images?.[0]?.url || "https://placehold.co/40x40?text=?"}
                alt=""
                className="w-10 h-10 rounded-lg object-cover bg-gray-50"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {p.name}
                </p>
                <p className="text-xs text-gray-400">
                  GH₵{p.price.toLocaleString()}
                </p>
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {p.soldCount} sold
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
