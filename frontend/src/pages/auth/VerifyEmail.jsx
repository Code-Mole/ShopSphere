import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api.js";
import Spinner from "../../components/ui/Spinner.jsx";

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        const { data } = await api.get(`/auth/verify-email/${token}`);
        setMessage(data.message);
        setStatus("success");
      } catch (err) {
        setMessage(err.response?.data?.message || "Verification failed.");
        setStatus("error");
      }
    };
    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="card p-10 w-full max-w-md text-center animate-fade-in">
        {status === "loading" && (
          <>
            <div className="flex justify-center mb-4">
              <Spinner size="lg" color="primary" />
            </div>
            <p className="text-gray-500">Verifying your email…</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Email verified!
            </h2>
            <p className="text-gray-500 mb-6">{message}</p>
            <Link to="/login" className="btn-primary w-full justify-center">
              Continue to Login
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verification failed
            </h2>
            <p className="text-gray-500 mb-6">{message}</p>
            <Link
              to="/register"
              className="btn-secondary w-full justify-center"
            >
              Back to Register
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
