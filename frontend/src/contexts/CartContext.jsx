import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../services/api.js";
import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

    const fetchCart = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/cart");
        setCart(data.data);
      } catch {
        setCart(null);
      } finally {
        setLoading(false);
      }
    };

  // Fetch cart whenever a user logs in
  useEffect(() => {
    if (user) fetchCart();
    else setCart(null);
  }, [user]);


  const addToCart = useCallback(
    async (productId, quantity = 1, variant = {}) => {
      const { data } = await api.post("/cart", {
        productId,
        quantity,
        variant,
      });
      setCart(data.data);
      return data;
    },
    [],
  );

  const updateItem = useCallback(async (itemId, quantity) => {
    const { data } = await api.put(`/cart/${itemId}`, { quantity });
    setCart(data.data);
  }, []);

  const removeItem = useCallback(async (itemId) => {
    const { data } = await api.delete(`/cart/${itemId}`);
    setCart(data.data);
  }, []);

  const clearCart = useCallback(async () => {
    await api.delete("/cart");
    setCart((prev) => ({ ...prev, items: [] }));
  }, []);

  const itemCount = cart?.itemCount ?? 0;
  const subtotal = cart?.subtotal ?? 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        itemCount,
        subtotal,
        addToCart,
        updateItem,
        removeItem,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
