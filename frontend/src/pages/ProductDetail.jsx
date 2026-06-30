import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { productService } from "../services/product.service.js";
import ProductGrid from "../components/product/ProductGrid.jsx";
import Spinner from "../components/ui/Spinner.jsx";

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      window.scrollTo(0, 0);
      try {
        const { data } = await productService.getProduct(slug);
        setProduct(data.data);
        setImgIndex(0);
        // Fetch related
        const rel = await productService.getRelated(data.data._id);
        setRelated(rel.data.data);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-24">
        <p className="text-xl font-semibold text-gray-900">Product not found</p>
        <Link to="/products" className="btn-primary mt-6 inline-flex">
          Browse Products
        </Link>
      </div>
    );
  }

  const image =
    product.images?.[imgIndex]?.url ||
    "https://placehold.co/600x600?text=No+Image";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link to="/" className="hover:text-gray-600">
          Home
        </Link>
        <span>/</span>
        <Link to="/products" className="hover:text-gray-600">
          Products
        </Link>
        <span>/</span>
        <Link
          to={`/products?category=${product.category?.slug}`}
          className="hover:text-gray-600"
        >
          {product.category?.name}
        </Link>
        <span>/</span>
        <span className="text-gray-700 font-medium truncate">
          {product.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        {/* Image Gallery */}
        <div>
          <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-3">
            <img
              src={image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIndex(i)}
                  className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === imgIndex
                      ? "border-primary-500"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          {/* Brand & badges */}
          <div className="flex items-center gap-2 mb-2">
            {product.brand && (
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                {product.brand}
              </span>
            )}
            {product.isFeatured && (
              <span className="badge bg-primary-100 text-primary-700">
                Featured
              </span>
            )}
            {product.discountPercent > 0 && (
              <span className="badge bg-red-100 text-red-700">
                -{product.discountPercent}% off
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            {product.name}
          </h1>

          {/* Rating */}
          {product.ratings?.count > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-4 h-4 ${star <= Math.round(product.ratings.average) ? "text-amber-400" : "text-gray-200"}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {product.ratings.average.toFixed(1)} ({product.ratings.count}{" "}
                reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-end gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900">
              GH₵{product.price.toLocaleString()}
            </span>
            {product.comparePrice > product.price && (
              <span className="text-lg text-gray-400 line-through mb-0.5">
                GH₵{product.comparePrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed mb-6">
            {product.description}
          </p>

          {/* Stock status */}
          <div className="flex items-center gap-2 mb-6">
            {product.stock > 0 ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm text-green-700 font-medium">
                  {product.stock < 10
                    ? `Only ${product.stock} left`
                    : "In Stock"}
                </span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-sm text-red-600 font-medium">
                  Out of Stock
                </span>
              </>
            )}
          </div>

          {/* Quantity + Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {/* Quantity selector */}
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden w-fit">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-10 h-11 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
              >
                −
              </button>
              <span className="w-10 text-center text-sm font-medium">
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                disabled={qty >= product.stock}
                className="w-10 h-11 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40"
              >
                +
              </button>
            </div>

            <button
              disabled={!product.inStock}
              className="btn-primary flex-1 py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                /* wired in Module 4 */
              }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Add to Cart
            </button>

            <button className="btn-secondary p-3">
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
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
          </div>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/products?keyword=${tag}`}
                  className="badge bg-gray-100 text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors text-xs px-3 py-1"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            You might also like
          </h2>
          <ProductGrid products={related} loading={false} />
        </div>
      )}
    </div>
  );
}
