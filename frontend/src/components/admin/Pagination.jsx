export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="btn-secondary text-sm disabled:opacity-40"
      >
        ← Prev
      </button>
      <span className="text-sm text-gray-500 px-2">
        {page} / {totalPages}
      </span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="btn-secondary text-sm disabled:opacity-40"
      >
        Next →
      </button>
    </div>
  );
}
