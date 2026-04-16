import { apiRequest } from "./api-client";
import type {
  ApiResponse,
  LoginData,
  LoginRequest,
  RegisterRequest,
  User,
} from "@/types/api";

export const authService = {
  register: (payload: RegisterRequest) =>
    apiRequest<ApiResponse<User>>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: LoginRequest) =>
    apiRequest<ApiResponse<LoginData>>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  logout: () =>
    apiRequest<ApiResponse<Record<string, never>>>("/auth/logout", {
      method: "POST",
    }),

  getCurrentUser: () => apiRequest<ApiResponse<User>>("/user/get-current-user"),
};
