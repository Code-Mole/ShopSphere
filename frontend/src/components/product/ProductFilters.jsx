import { useState, useEffect } from "react";
import { productService } from "../../services/product.service.js";

export default function ProductFilters({ filters, onChange }) {
  const [categories, setCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({
    min: filters.minPrice || "",
    max: filters.maxPrice || "",
  });

  useEffect(() => {
    productService.getCategories().then(({ data }) => setCategories(data.data));
  }, []);

  const handle = (key, value) => onChange({ [key]: value });

  const applyPrice = () => {
    onChange({ minPrice: priceRange.min, maxPrice: priceRange.max });
  };

  const Section = ({ title, children }) => (
    <div className="border-b border-gray-100 pb-5 mb-5 last:border-0">
      <h4 className="text-sm font-semibold text-gray-800 mb-3">{title}</h4>
      {children}
    </div>
  );

  return (
    <aside className="w-full">
      {/* Categories */}
      <Section title="Category">
        <ul className="space-y-1.5">
          <li>
            <button
              onClick={() => handle("category", "")}
              className={`text-sm w-full text-left px-2 py-1.5 rounded-lg transition-colors ${
                !filters.category
                  ? "bg-primary-50 text-primary-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              All Categories
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat._id}>
              <button
                onClick={() => handle("category", cat.slug)}
                className={`text-sm w-full text-left px-2 py-1.5 rounded-lg transition-colors ${
                  filters.category === cat.slug
                    ? "bg-primary-50 text-primary-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </Section>

      {/* Price Range */}
      <Section title="Price Range (GH₵)">
        <div className="flex gap-2 items-center mb-2">
          <input
            type="number"
            placeholder="Min"
            min={0}
            value={priceRange.min}
            onChange={(e) =>
              setPriceRange((p) => ({ ...p, min: e.target.value }))
            }
            className="input text-sm py-2"
          />
          <span className="text-gray-400 shrink-0">—</span>
          <input
            type="number"
            placeholder="Max"
            min={0}
            value={priceRange.max}
            onChange={(e) =>
              setPriceRange((p) => ({ ...p, max: e.target.value }))
            }
            className="input text-sm py-2"
          />
        </div>
        <button
          onClick={applyPrice}
          className="btn-secondary w-full text-sm py-2"
        >
          Apply
        </button>
      </Section>

      {/* Availability */}
      <Section title="Availability">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStock === "true"}
            onChange={(e) => handle("inStock", e.target.checked ? "true" : "")}
            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">In Stock Only</span>
        </label>
      </Section>
    </aside>
  );
}
