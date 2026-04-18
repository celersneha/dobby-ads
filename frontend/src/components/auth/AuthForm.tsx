import { Button } from "@/components/ui/button";
import { useAuthForm } from "@/hooks/useAuthForm";
import type { AuthFormValues } from "@/hooks/useAuthForm";

export type { AuthFormValues };

interface AuthFormProps {
  mode: "login" | "register";
  loading: boolean;
  error: string | null;
  onSubmit: (values: AuthFormValues) => Promise<void>;
}

export function AuthForm({ mode, loading, error, onSubmit }: AuthFormProps) {
  const { isRegister, values, updateField, handleSubmit } = useAuthForm({
    mode,
    onSubmit,
  });

  return (
    <form onSubmit={handleSubmit} className="panel-surface space-y-4 p-6">
      <h1 className="text-2xl font-semibold text-foreground">
        {isRegister ? "Create account" : "Welcome back"}
      </h1>

      {isRegister ? (
        <label className="block space-y-2">
          <span className="text-sm text-muted-foreground">Name</span>
          <input
            required
            value={values.Name}
            onChange={(e) => updateField("Name", e.target.value)}
            className="form-field"
            placeholder="John Doe"
          />
        </label>
      ) : null}

      <label className="block space-y-2">
        <span className="text-sm text-muted-foreground">Email</span>
        <input
          type="email"
          required
          value={values.email}
          onChange={(e) => updateField("email", e.target.value)}
          className="form-field"
          placeholder="john@example.com"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm text-muted-foreground">Password</span>
        <input
          type="password"
          required
          value={values.password}
          onChange={(e) => updateField("password", e.target.value)}
          className="form-field"
          placeholder="********"
        />
      </label>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Please wait..." : isRegister ? "Create account" : "Login"}
      </Button>
    </form>
  );
}
