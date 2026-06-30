import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { orderService } from "../services/order.service.js";
import Spinner from "../components/ui/Spinner.jsx";

const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const { data } = await orderService.getOrder(id);
      setOrder(data.data);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    try {
      await orderService.cancelOrder(id, "Customer requested cancellation");
      fetchOrder();
    } finally {
      setCancelling(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" color="primary" />
      </div>
    );
  if (!order)
    return (
      <div className="text-center py-24 text-gray-500">Order not found.</div>
    );

  const currentStepIndex = STATUS_STEPS.indexOf(order.status);
  const canCancel = ["pending", "processing"].includes(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/orders"
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-flex items-center gap-1"
      >
        ← Back to Orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {order.orderNumber}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="btn-danger text-sm"
          >
            {cancelling ? <Spinner size="sm" color="white" /> : "Cancel Order"}
          </button>
        )}
      </div>

      {/* Status Tracker */}
      {order.status !== "cancelled" ? (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between relative">
            {STATUS_STEPS.map((step, i) => (
              <div
                key={step}
                className="flex-1 flex flex-col items-center relative z-10"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    i <= currentStepIndex
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {i < currentStepIndex ? "✓" : i + 1}
                </div>
                <span
                  className={`text-xs mt-2 font-medium ${i <= currentStepIndex ? "text-gray-900" : "text-gray-400"}`}
                >
                  {step.charAt(0).toUpperCase() + step.slice(1)}
                </span>
                {i < STATUS_STEPS.length - 1 && (
                  <div
                    className={`absolute top-4 left-1/2 w-full h-0.5 -z-10 ${
                      i < currentStepIndex ? "bg-primary-600" : "bg-gray-100"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card p-5 mb-6 bg-red-50 border-red-200">
          <p className="text-sm text-red-700 font-medium">Order Cancelled</p>
          <p className="text-xs text-red-500 mt-1">{order.cancelReason}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Items</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item._id} className="flex items-center gap-4">
                <img
                  src={item.image || "https://placehold.co/60x60?text=?"}
                  alt=""
                  className="w-14 h-14 rounded-lg object-cover bg-gray-50"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    Qty: {item.quantity} × GH₵{item.price.toLocaleString()}
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  GH₵{(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Summary + Address */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>GH₵{order.pricing.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>GH₵{order.pricing.shippingFee.toLocaleString()}</span>
              </div>
              {order.pricing.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>−GH₵{order.pricing.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-2 flex justify-between font-semibold text-gray-900">
                <span>Total</span>
                <span>GH₵{order.pricing.total.toLocaleString()}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">Payment Status</p>
              <span
                className={`badge mt-1 ${order.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
              >
                {order.paymentStatus.charAt(0).toUpperCase() +
                  order.paymentStatus.slice(1)}
              </span>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-3">
              Shipping Address
            </h2>
            <p className="text-sm text-gray-700 font-medium">
              {order.shippingAddress.fullName}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {order.shippingAddress.addressLine1}
            </p>
            {order.shippingAddress.addressLine2 && (
              <p className="text-sm text-gray-500">
                {order.shippingAddress.addressLine2}
              </p>
            )}
            <p className="text-sm text-gray-500">
              {order.shippingAddress.city}, {order.shippingAddress.region}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {order.shippingAddress.phone}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
