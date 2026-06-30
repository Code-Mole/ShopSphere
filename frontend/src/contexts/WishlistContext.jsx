import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../services/api.js";
import { useAuth } from "./AuthContext.jsx";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const fetchWishlist = async () => {
    try {
      const { data } = await api.get("/wishlist");
      setWishlistIds(new Set(data.data.products.map((p) => p._id || p)));
    } catch {
      setWishlistIds(new Set());
    }
  };

  useEffect(() => {
    if (user) fetchWishlist();
    else setWishlistIds(new Set());
  }, [user]);


  const toggle = useCallback(async (productId) => {
    const { data } = await api.post("/wishlist/toggle", { productId });
    setWishlistIds((prev) => {
      const next = new Set(prev);
      data.data.action === "added"
        ? next.add(productId)
        : next.delete(productId);
      return next;
    });
    return data.data.action;
  }, []);

  const isWishlisted = useCallback(
    (productId) => wishlistIds.has(productId),
    [wishlistIds],
  );

  return (
    <WishlistContext.Provider
      value={{ wishlistIds, toggle, isWishlisted, fetchWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
};
