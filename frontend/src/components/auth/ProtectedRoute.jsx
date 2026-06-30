import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import Spinner from "../ui/Spinner.jsx";

/**
 * Wraps any route that needs authentication.
 * Optionally restricts to a specific role (e.g. 'admin').
 */
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Still checking for an existing session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  // Not logged in — send to login, preserving where they wanted to go
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but wrong role
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
