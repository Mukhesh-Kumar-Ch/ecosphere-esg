import { clientEnv } from "@/config/env";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errors?: unknown;
};

async function request<T>(path: string, init: RequestInit = {}) {
  const token = localStorage.getItem("ecosphere_access_token");
  const response = await fetch(`${clientEnv.VITE_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Request failed.");
  }

  return payload.data;
}

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: { id: string; name: string; description: string | null };
  department: { id: string; name: string; code: string; status: string };
};

export type AuthSession = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthSession>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  signup: (email: string, password: string, confirmPassword: string) =>
    request<AuthSession>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, confirmPassword }),
    }),
  me: () => request<{ user: AuthUser }>("/auth/me"),
  refresh: (refreshToken: string) =>
    request<AuthSession>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),
  logout: () => request<{ loggedOut: boolean }>("/auth/logout", { method: "POST" }),
};

export { request };
