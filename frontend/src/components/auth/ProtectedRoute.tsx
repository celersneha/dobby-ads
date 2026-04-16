import { Navigate } from "react-router";
import { useAppSelector } from "@/redux/hooks";
import {
  selectAuthLoading,
  selectIsAuthenticated,
} from "@/redux/selectors/authSelectors";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isLoading = useAppSelector(selectAuthLoading);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (isLoading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
