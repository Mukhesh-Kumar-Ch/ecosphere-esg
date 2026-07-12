import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="grid min-h-screen place-items-center text-slate-600">Loading session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
