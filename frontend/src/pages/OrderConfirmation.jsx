import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { orderService } from "../services/order.service.js";
import { useCart } from "../contexts/CartContext.jsx";
import Spinner from "../components/ui/Spinner.jsx";

export default function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchCart } = useCart();

  const [status, setStatus] = useState("verifying"); // verifying | success | failed
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const reference =
      searchParams.get("reference") || searchParams.get("trxref");
    if (!reference) {
      setStatus("failed");
      setError("No payment reference found.");
      return;
    }

    const verify = async () => {
      try {
        const { data } = await orderService.verifyPayment(reference);
        setOrder(data.data.order);
        setStatus("success");
        fetchCart(); // Refresh cart context — it's now empty
      } catch (err) {
        setStatus("failed");
        setError(err.response?.data?.message || "Payment verification failed.");
      }
    };
    verify();
  }, [searchParams]);

  if (status === "verifying") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <Spinner size="lg" color="primary" />
        <p className="text-gray-500 mt-4">Verifying your payment…</p>
        <p className="text-gray-400 text-sm mt-1">
          Please don't close this page.
        </p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Failed
        </h1>
        <p className="text-gray-500 mb-6 max-w-md">{error}</p>
        <div className="flex gap-3">
          <Link to="/cart" className="btn-secondary">
            Back to Cart
          </Link>
          <Link to="/products" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-fade-in">
        <svg
          className="w-10 h-10 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Order Confirmed!
      </h1>
      <p className="text-gray-500 mb-1">Thank you for your purchase.</p>
      <p className="text-gray-400 text-sm mb-8">
        Order{" "}
        <span className="font-semibold text-gray-700">{order.orderNumber}</span>{" "}
        · We've sent a confirmation to your email.
      </p>

      <div className="card p-6 max-w-md w-full text-left mb-8">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500">Order Total</span>
          <span className="font-semibold text-gray-900">
            GH₵{order.pricing.total.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500">Items</span>
          <span className="font-medium text-gray-900">
            {order.items.length}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Estimated Delivery</span>
          <span className="font-medium text-gray-900">
            {order.deliveryOption === "express"
              ? "1–2 business days"
              : "3–5 business days"}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <Link to={`/orders/${order._id}`} className="btn-primary">
          View Order Details
        </Link>
        <Link to="/products" className="btn-secondary">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
