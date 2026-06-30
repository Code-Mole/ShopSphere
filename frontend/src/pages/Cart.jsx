import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import Spinner from "../components/ui/Spinner.jsx";

export default function Cart() {
  const {
    cart,
    loading,
    itemCount,
    subtotal,
    updateItem,
    removeItem,
    clearCart,
  } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Your cart</h2>
        <p className="text-gray-500 mb-6">
          Sign in to view and manage your cart.
        </p>
        <Link to="/login" className="btn-primary">
          Sign In
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <svg
          className="w-20 h-20 text-gray-200 mx-auto mb-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Your cart is empty
        </h2>
        <p className="text-gray-500 mb-6">Add some products to get started.</p>
        <Link to="/products" className="btn-primary">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Shopping Cart{" "}
          <span className="text-gray-400 font-normal">({itemCount} items)</span>
        </h1>
        <button
          onClick={clearCart}
          className="text-sm text-red-500 hover:text-red-700 hover:underline"
        >
          Clear cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const product = item.product;
            const image =
              product?.images?.[0]?.url ||
              "https://placehold.co/100x100?text=?";
            const itemTotal = item.price * item.quantity;

            return (
              <div key={item._id} className="card p-4 flex gap-4">
                {/* Product image */}
                <Link to={`/products/${product?.slug}`} className="shrink-0">
                  <img
                    src={image}
                    alt={product?.name}
                    className="w-20 h-20 object-cover rounded-xl bg-gray-50"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${product?.slug}`}
                    className="text-sm font-medium text-gray-900 hover:text-primary-600 line-clamp-2"
                  >
                    {product?.name}
                  </Link>
                  {product?.brand && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {product.brand}
                    </p>
                  )}
                  {item.variant?.name && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.variant.name}: {item.variant.value}
                    </p>
                  )}
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    GH₵{item.price.toLocaleString()}
                  </p>
                </div>

                {/* Quantity + Remove */}
                <div className="flex flex-col items-end justify-between shrink-0">
                  <button
                    onClick={() => removeItem(item._id)}
                    className="text-gray-300 hover:text-red-400 transition-colors"
                    aria-label="Remove item"
                  >
                    <svg
                      className="w-4 h-4"
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
                  </button>

                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() =>
                          item.quantity > 1
                            ? updateItem(item._id, item.quantity - 1)
                            : removeItem(item._id)
                        }
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-sm"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateItem(item._id, item.quantity + 1)}
                        disabled={item.quantity >= (product?.stock || 0)}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-sm disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-xs font-semibold text-gray-700">
                      GH₵{itemTotal.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">
              Order Summary
            </h2>

            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal ({itemCount} items)</span>
                <span>GH₵{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">
                  Calculated at checkout
                </span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-semibold text-gray-900">
                <span>Total</span>
                <span>GH₵{subtotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="btn-primary w-full justify-center py-3 text-base"
            >
              Proceed to Checkout
            </button>

            <Link
              to="/products"
              className="block text-center text-sm text-gray-500 hover:text-gray-700 mt-4"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
