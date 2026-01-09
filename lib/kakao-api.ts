import { apiFetch } from "./api";

export async function getKakaoAuthorizeUrl(): Promise<string> {
  const res = await apiFetch<{ authorizeUrl: string }>("/api/kakao/oauth/start", { method: "GET" });
  return res.authorizeUrl;
}

export async function exchangeKakaoCode(code: string, state: string): Promise<void> {
  await apiFetch("/api/kakao/oauth/exchange", {
    method: "POST",
    json: { code, state },
  });
}