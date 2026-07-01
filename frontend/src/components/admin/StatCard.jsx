export default function StatCard({ label, value, change, icon, prefix = "" }) {
  const isPositive = change >= 0;
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">{label}</span>
        <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">
        {prefix}
        {value}
      </p>
      {change !== undefined && (
        <p
          className={`text-xs mt-2 flex items-center gap-1 ${isPositive ? "text-green-600" : "text-red-500"}`}
        >
          <svg
            className={`w-3 h-3 ${!isPositive && "rotate-180"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          {Math.abs(change)}% vs last month
        </p>
      )}
    </div>
  );
}
