import { useAppSelector } from "@/redux/hooks";
import {
  selectAuthLoading,
  selectIsAuthenticated,
} from "@/redux/selectors/authSelectors";

export function useProtectedRoute() {
  const isLoading = useAppSelector(selectAuthLoading);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  return {
    isLoading,
    isAuthenticated,
  };
}
