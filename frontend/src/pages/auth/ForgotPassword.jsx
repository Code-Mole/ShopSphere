import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api.js";
import { useForm } from "../../hooks/useForm.js";
import InputField from "../../components/ui/InputField.jsx";
import Alert from "../../components/ui/Alert.jsx";
import Spinner from "../../components/ui/Spinner.jsx";

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const {
    values,
    errors,
    loading,
    alert,
    handleChange,
    setLoading,
    setAlert,
    setErrors,
  } = useForm({ email: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!values.email) {
      setErrors({ email: "Email is required" });
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: values.email });
      setSent(true);
    } catch (err) {
      setAlert({
        type: "error",
        message: err.response?.data?.message || "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">ShopSphere</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">
            Forgot your password?
          </h1>
          <p className="mt-1 text-gray-500">
            We'll send a reset link to your email.
          </p>
        </div>

        <div className="card p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-7 h-7 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Check your email
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                We've sent a reset link to <strong>{values.email}</strong>. It
                expires in 1 hour.
              </p>
              <Link to="/login" className="btn-secondary w-full justify-center">
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <Alert type={alert.type} message={alert.message} />
              <form
                onSubmit={handleSubmit}
                className="mt-4 space-y-5"
                noValidate
              >
                <InputField
                  label="Email Address"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={values.email}
                  onChange={handleChange}
                  error={errors.email}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-3"
                >
                  {loading ? (
                    <Spinner size="sm" color="white" />
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>
              <p className="mt-6 text-center text-sm text-gray-500">
                Remember it?{" "}
                <Link
                  to="/login"
                  className="text-primary-600 font-medium hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
