import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useCart } from "../contexts/CartContext.jsx";
import { useWishlist } from "../contexts/WishlistContext.jsx";
import api from "../services/api.js";
import Spinner from "../components/ui/Spinner.jsx";

export default function Wishlist() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toggle } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(null);

    const fetchWishlist = async () => {
      try {
        const { data } = await api.get("/wishlist");
        setProducts(data.data.products || []);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (user) fetchWishlist();
    else setLoading(false);
  }, [user]);


  const handleRemove = async (productId) => {
    await toggle(productId);
    setProducts((prev) => prev.filter((p) => p._id !== productId));
  };

  const handleAddToCart = async (productId) => {
    setAdding(productId);
    try {
      await addToCart(productId, 1);
    } finally {
      setAdding(null);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Your Wishlist</h2>
        <p className="text-gray-500 mb-6">
          Sign in to view your saved products.
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        My Wishlist{" "}
        <span className="text-gray-400 font-normal">({products.length})</span>
      </h1>

      {products.length === 0 ? (
        <div className="text-center py-24">
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
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Your wishlist is empty
          </h2>
          <p className="text-gray-500 mb-6">
            Save products you love by clicking the heart icon.
          </p>
          <Link to="/products" className="btn-primary">
            Discover Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product) => {
            const image =
              product.images?.[0]?.url || "https://placehold.co/300x300?text=?";
            return (
              <div key={product._id} className="card overflow-hidden group">
                <div className="relative aspect-square bg-gray-50">
                  <Link to={`/products/${product.slug}`}>
                    <img
                      src={image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  <button
                    onClick={() => handleRemove(product._id)}
                    className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm text-red-400 hover:text-red-600 hover:shadow-md transition-all"
                    aria-label="Remove from wishlist"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
                <div className="p-3">
                  <Link
                    to={`/products/${product.slug}`}
                    className="text-sm font-medium text-gray-900 hover:text-primary-600 line-clamp-2 block mb-2"
                  >
                    {product.name}
                  </Link>
                  <p className="text-sm font-bold text-gray-900 mb-3">
                    GH₵{product.price?.toLocaleString()}
                  </p>
                  <button
                    onClick={() => handleAddToCart(product._id)}
                    disabled={adding === product._id || product.stock === 0}
                    className="btn-primary w-full justify-center py-2 text-xs disabled:opacity-50"
                  >
                    {adding === product._id ? (
                      <Spinner size="sm" color="white" />
                    ) : product.stock === 0 ? (
                      "Out of Stock"
                    ) : (
                      "Add to Cart"
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
