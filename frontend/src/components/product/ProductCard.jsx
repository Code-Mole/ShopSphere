import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  const {
    name,
    slug,
    price,
    comparePrice,
    images,
    ratings,
    brand,
    discountPercent,
    inStock,
  } = product;

  const image =
    images?.[0]?.url || "https://placehold.co/400x400?text=No+Image";

  return (
    <Link to={`/products/${slug}`} className="group block">
      <div className="card overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
        {/* Image */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {/* Discount badge */}
          {discountPercent > 0 && (
            <span className="absolute top-2 left-2 badge bg-red-500 text-white">
              -{discountPercent}%
            </span>
          )}
          {/* Out of stock overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="badge bg-gray-200 text-gray-600 text-sm">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          {brand && (
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
              {brand}
            </p>
          )}
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">
            {name}
          </h3>

          {/* Rating */}
          {ratings?.count > 0 && (
            <div className="flex items-center gap-1.5 mb-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-3.5 h-3.5 ${star <= Math.round(ratings.average) ? "text-amber-400" : "text-gray-200"}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs text-gray-400">({ratings.count})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-gray-900">
              GH₵{price.toLocaleString()}
            </span>
            {comparePrice > price && (
              <span className="text-sm text-gray-400 line-through">
                GH₵{comparePrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
