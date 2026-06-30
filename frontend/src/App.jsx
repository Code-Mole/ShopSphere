import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import MainLayout from "./layouts/MainLayout.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";
import VerifyEmail from "./pages/auth/VerifyEmail.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes with main layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />

          {/* Protected customer route example — more added in Module 3 */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div className="p-8 text-center text-gray-500">
                  Customer Dashboard (Module 4)
                </div>
              </ProtectedRoute>
            }
          />

          {/* Admin-only route example */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <div className="p-8 text-center text-gray-500">
                  Admin Dashboard (Module 6)
                </div>
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
