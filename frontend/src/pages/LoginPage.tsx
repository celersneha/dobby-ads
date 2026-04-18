import { Link, Navigate } from "react-router";
import { AuthForm } from "@/components/auth/AuthForm";
import { useLoginPage } from "@/hooks/useLoginPage";

export default function LoginPage() {
  const { isAuthenticated, isLoading, error, handleSubmit } = useLoginPage();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

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
