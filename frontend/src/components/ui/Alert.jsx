const variants = {
  success: "bg-green-50 text-green-800 border-green-200",
  error: "bg-red-50   text-red-800   border-red-200",
  info: "bg-blue-50  text-blue-800  border-blue-200",
  warning: "bg-amber-50 text-amber-800 border-amber-200",
};

export default function Alert({ type = "info", message }) {
  if (!message) return null;
  return (
    <div
      className={`${variants[type]} border rounded-lg px-4 py-3 text-sm`}
      role="alert"
    >
      {message}
    </div>
  );
}
