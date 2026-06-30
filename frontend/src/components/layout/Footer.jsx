import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-white font-bold text-lg">ShopSphere</span>
            </div>
            <p className="text-sm leading-relaxed">
              AI-powered shopping for the modern consumer.
            </p>
          </div>
          {[
            {
              title: "Shop",
              links: [
                { to: "/products", label: "All Products" },
                { to: "/products?featured=true", label: "Featured" },
              ],
            },
            {
              title: "Account",
              links: [
                { to: "/login", label: "Sign In" },
                { to: "/register", label: "Create Account" },
                { to: "/orders", label: "My Orders" },
                { to: "/dashboard", label: "Dashboard" },
              ],
            },
            {
              title: "Support",
              links: [
                { to: "/#", label: "Help Center" },
                { to: "/#", label: "Contact Us" },
                { to: "/#", label: "Privacy Policy" },
                { to: "/#", label: "Terms of Service" },
              ],
            },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="text-white font-semibold text-sm mb-3">{title}</h4>
              <ul className="space-y-2">
                {links.map(({ to, label }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-xs">
          © {new Date().getFullYear()} ShopSphere. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
