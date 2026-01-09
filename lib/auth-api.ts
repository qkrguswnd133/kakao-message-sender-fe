import { apiFetch } from "./api";

export type MeResponse = { username: string; role: "ADMIN" | "USER" | string };

export async function login(username: string, password: string): Promise<void> {
  await apiFetch<void>("/api/auth/login", {
    method: "POST",
    json: { username, password },
  });
}

export async function me(): Promise<MeResponse> {
  return apiFetch<MeResponse>("/api/auth/me", {
    method: "GET",
  });
}

export async function logout(): Promise<void> {
  await apiFetch<void>("/api/auth/logout", {
    method: "POST",
  });
}

export async function getKakaoStatus(): Promise<{ linked: boolean }> {
  return apiFetch("/api/kakao/status", { method: "GET" });
}

export async function kakaoUnlink(): Promise<void> {
  await apiFetch("/api/kakao/unlink", { method: "POST" });
}

export type AdminUser = {
  id: number;
  username: string;
  role: string; // "ADMIN" | "USER"
  enabled: boolean;
  apiKey: string | null;
  clientSecret?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateUserRequest = {
  username: string;
  password: string;
  role: "ADMIN" | "USER";
  enabled?: boolean;
  apiKey?: string;
  clientSecret?: string;
};

export type UpdateUserRequest = {
  role?: "ADMIN" | "USER";
  enabled?: boolean;
  apiKey?: string; // "" 보내면 비우기
  clientSecret?: string;
};

export async function listAdminUsers(): Promise<AdminUser[]> {
  return apiFetch<AdminUser[]>("/api/admin/users", { method: "GET" });
}

export async function createAdminUser(req: CreateUserRequest): Promise<AdminUser> {
  return apiFetch<AdminUser>("/api/admin/users", { method: "POST", json: req });
}

export async function updateAdminUser(id: number, req: UpdateUserRequest): Promise<AdminUser> {
  return apiFetch<AdminUser>(`/api/admin/users/${id}`, { method: "PATCH", json: req });
}

export async function resetAdminUserPassword(id: number, newPassword: string): Promise<void> {
  await apiFetch<void>(`/api/admin/users/${id}/password`, {
    method: "POST",
    json: { newPassword },
  });
}