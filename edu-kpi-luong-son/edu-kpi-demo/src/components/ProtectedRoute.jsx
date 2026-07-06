import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children, allowRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-cream">
        <div className="animate-pulse text-primary-500 font-display font-medium">
          Đang tải phiên làm việc…
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowRoles && !allowRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
