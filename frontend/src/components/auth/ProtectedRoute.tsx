import { Navigate } from "react-router";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoading, isAuthenticated } = useProtectedRoute();

  if (isLoading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
