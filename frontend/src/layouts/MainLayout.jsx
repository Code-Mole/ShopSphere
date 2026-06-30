import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar.jsx";
import Footer from "../components/layout/Footer.jsx";
import { CartProvider } from "../contexts/CartContext.jsx";
import { WishlistProvider } from "../contexts/WishlistContext.jsx";

export default function MainLayout() {
  return (
    <CartProvider>
      <WishlistProvider>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
        </div>
      </WishlistProvider>
    </CartProvider>
  );
}
