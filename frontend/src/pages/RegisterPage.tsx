import { Link, useNavigate } from "react-router";
import { AuthForm, type AuthFormValues } from "@/components/auth/AuthForm";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  selectAuthError,
  selectAuthLoading,
} from "@/redux/selectors/authSelectors";
import {
  clearAuthError,
  loginUser,
  registerUser,
} from "@/redux/slices/authSlice";

export default function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  const handleSubmit = async (values: AuthFormValues) => {
    if (!values.Name) {
      return;
    }

    dispatch(clearAuthError());

    const registerResult = await dispatch(
      registerUser({
        Name: values.Name,
        email: values.email,
        password: values.password,
      }),
    );

    if (registerUser.fulfilled.match(registerResult)) {
      const loginResult = await dispatch(
        loginUser({ email: values.email, password: values.password }),
      );

      if (loginUser.fulfilled.match(loginResult)) {
        navigate("/dashboard");
      }
    }
  };

  return (
    <section className="mx-auto max-w-md space-y-5">
      <AuthForm
        mode="register"
        loading={isLoading}
        error={error}
        onSubmit={handleSubmit}
      />
      <p className="text-center text-sm text-muted-foreground">
        Already registered?{" "}
        <Link to="/login" className="subtle-link">
          Login
        </Link>
      </p>
    </section>
  );
}
