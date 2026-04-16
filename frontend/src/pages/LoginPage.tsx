import { Link, Navigate, useNavigate } from "react-router";
import { AuthForm, type AuthFormValues } from "@/components/auth/AuthForm";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  selectAuthError,
  selectAuthLoading,
  selectIsAuthenticated,
} from "@/redux/selectors/authSelectors";
import { clearAuthError, loginUser } from "@/redux/slices/authSlice";

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (values: AuthFormValues) => {
    dispatch(clearAuthError());
    const result = await dispatch(
      loginUser({
        email: values.email,
        password: values.password,
      }),
    );

    if (loginUser.fulfilled.match(result)) {
      navigate("/dashboard");
    }
  };

  return (
    <section className="mx-auto max-w-md space-y-5">
      <AuthForm
        mode="login"
        loading={isLoading}
        error={error}
        onSubmit={handleSubmit}
      />
      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link to="/register" className="subtle-link">
          Create an account
        </Link>
      </p>
    </section>
  );
}
