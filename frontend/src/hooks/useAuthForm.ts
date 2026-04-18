import { useState } from "react";

export interface AuthFormValues {
  Name?: string;
  email: string;
  password: string;
}

interface UseAuthFormParams {
  mode: "login" | "register";
  onSubmit: (values: AuthFormValues) => Promise<void>;
}

export function useAuthForm({ mode, onSubmit }: UseAuthFormParams) {
  const [values, setValues] = useState<AuthFormValues>({
    Name: "",
    email: "",
    password: "",
  });

  const isRegister = mode === "register";

  const updateField = (field: keyof AuthFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(values);
  };

  return {
    isRegister,
    values,
    updateField,
    handleSubmit,
  };
}
