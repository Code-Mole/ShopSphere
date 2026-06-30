import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { reviewService } from "../../services/cart.service.js";
import StarRating from "../ui/StarRating.jsx";
import Alert from "../ui/Alert.jsx";
import Spinner from "../ui/Spinner.jsx";

export default function ReviewSection({ productId }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    rating: 0,
    title: "",
    comment: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

 const loadReviews = async () => {
   setLoading(true);
   try {
     const { data } = await reviewService.getReviews(productId, {
       page,
       limit: 5,
     });
     setReviews(data.data);
     setMeta(data.meta);
   } finally {
     setLoading(false);
   }
 };

   const loadMyReview = async () => {
    try {
      const { data } = await reviewService.getMyReview(productId);
      if (data.data) {
        setMyReview(data.data);
        setFormData({
          rating: data.data.rating,
          title: data.data.title,
          comment: data.data.comment,
        });
      }
    } catch {}
  };
  useEffect(() => {
    loadReviews();
  }, [productId, page]);

  useEffect(() => {
    if (user) loadMyReview();
  }, [user, productId]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.rating === 0) {
      setAlert({ type: "error", message: "Please select a rating." });
      return;
    }
    if (!formData.comment.trim()) {
      setAlert({ type: "error", message: "Please write a comment." });
      return;
    }

    setSubmitting(true);
    setAlert({ type: "", message: "" });
    try {
      if (myReview) {
        await reviewService.updateReview(productId, myReview._id, formData);
        setAlert({ type: "success", message: "Review updated!" });
      } else {
        await reviewService.createReview(productId, formData);
        setAlert({ type: "success", message: "Review submitted!" });
      }
      setShowForm(false);
      loadReviews();
      loadMyReview();
    } catch (err) {
      setAlert({
        type: "error",
        message: err.response?.data?.message || "Failed to submit review.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete your review?")) return;
    try {
      await reviewService.deleteReview(productId, myReview._id);
      setMyReview(null);
      setFormData({ rating: 0, title: "", comment: "" });
      loadReviews();
    } catch {}
  };

  const timeAgo = (date) => {
    const secs = Math.floor((new Date() - new Date(date)) / 1000);
    if (secs < 60) return "just now";
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
    return `${Math.floor(secs / 86400)}d ago`;
  };

  return (
    <section className="mt-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-gray-900">
          Customer Reviews{" "}
          {meta && (
            <span className="text-gray-400 font-normal text-base">
              ({meta.total})
            </span>
          )}
        </h2>
        {user && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary text-sm"
          >
            {myReview ? "Edit My Review" : "Write a Review"}
          </button>
        )}
      </div>

      {/* Review Form */}
      {showForm && user && (
        <div className="card p-6 mb-8 animate-slide-up">
          <h3 className="font-semibold text-gray-900 mb-4">
            {myReview ? "Edit your review" : "Write a review"}
          </h3>
          <Alert type={alert.type} message={alert.message} />
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating *
              </label>
              <StarRating
                value={formData.rating}
                onChange={(r) => setFormData((p) => ({ ...p, rating: r }))}
                size="lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Title
              </label>
              <input
                type="text"
                placeholder="Summarise your experience"
                value={formData.title}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, title: e.target.value }))
                }
                className="input"
                maxLength={100}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Comment *
              </label>
              <textarea
                rows={4}
                placeholder="Tell others what you think about this product…"
                value={formData.comment}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, comment: e.target.value }))
                }
                className="input resize-none"
                maxLength={1000}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {formData.comment.length}/1000
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
              >
                {submitting ? (
                  <Spinner size="sm" color="white" />
                ) : myReview ? (
                  "Update Review"
                ) : (
                  "Submit Review"
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setAlert({ type: "", message: "" });
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* My existing review preview */}
      {myReview && !showForm && (
        <div className="card p-5 mb-6 border-l-4 border-primary-500">
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                Your review
              </span>
              <div className="mt-2">
                <StarRating value={myReview.rating} readOnly size="sm" />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(true)}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="text-xs text-red-500 hover:text-red-700 underline"
              >
                Delete
              </button>
            </div>
          </div>
          {myReview.title && (
            <p className="font-medium text-gray-900 text-sm mt-2">
              {myReview.title}
            </p>
          )}
          <p className="text-gray-600 text-sm mt-1">{myReview.comment}</p>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" color="primary" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <svg
            className="w-12 h-12 mx-auto mb-3 opacity-30"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <p className="text-sm">
            No reviews yet. Be the first to review this product!
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {reviews.map((review) => (
            <div key={review._id} className="card p-5">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-primary-700 font-semibold text-sm">
                    {review.user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {review.user?.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StarRating value={review.rating} readOnly size="sm" />
                        {review.isVerifiedPurchase && (
                          <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Verified Purchase
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {timeAgo(review.createdAt)}
                    </span>
                  </div>
                  {review.title && (
                    <p className="font-medium text-gray-900 text-sm mt-2">
                      {review.title}
                    </p>
                  )}
                  <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {meta?.totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className="btn-secondary text-sm disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="flex items-center text-sm text-gray-500">
                {page} / {meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= meta.totalPages}
                className="btn-secondary text-sm disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
