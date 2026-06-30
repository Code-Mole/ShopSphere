import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../../services/api.js";
import { useForm } from "../../hooks/useForm.js";
import Alert from "../../components/ui/Alert.jsx";
import Spinner from "../../components/ui/Spinner.jsx";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const {
    values,
    errors,
    loading,
    alert,
    handleChange,
    setLoading,
    setAlert,
    setErrors,
  } = useForm({ password: "", confirmPassword: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (values.password.length < 8) errs.password = "Minimum 8 characters";
    if (values.password !== values.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, {
        password: values.password,
      });
      setAlert({
        type: "success",
        message: "Password reset! Redirecting to login…",
      });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setAlert({
        type: "error",
        message: err.response?.data?.message || "Reset failed.",
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
            Set a new password
          </h1>
        </div>
        <div className="card p-8">
          <Alert type={alert.type} message={alert.message} />
          <form onSubmit={handleSubmit} className="mt-4 space-y-5" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={values.password}
                  onChange={handleChange}
                  className={
                    errors.password ? "input-error pr-10" : "input pr-10"
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                  tabIndex={-1}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm Password
              </label>
              <input
                name="confirmPassword"
                type="password"
                placeholder="Repeat your password"
                value={values.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "input-error" : "input"}
              />
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-500">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3"
            >
              {loading ? <Spinner size="sm" color="white" /> : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
