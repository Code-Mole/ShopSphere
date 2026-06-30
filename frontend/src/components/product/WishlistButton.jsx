import { useState } from "react";
import { useWishlist } from "../../contexts/WishlistContext.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function WishlistButton({ productId, className = "" }) {
  const { isWishlisted, toggle } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const wishlisted = isWishlisted(productId);

  const handleClick = async (e) => {
    e.preventDefault(); // Prevent link navigation on ProductCard
    if (!user) {
      navigate("/login");
      return;
    }
    setBusy(true);
    try {
      await toggle(productId);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      className={`p-2 rounded-full transition-all duration-200 disabled:opacity-50 ${
        wishlisted
          ? "bg-red-50 text-red-500 hover:bg-red-100"
          : "bg-white text-gray-400 hover:text-red-400 hover:bg-red-50 shadow-sm border border-gray-100"
      } ${className}`}
    >
      <svg
        className="w-4 h-4"
        fill={wishlisted ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
