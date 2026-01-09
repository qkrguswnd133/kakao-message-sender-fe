const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("Missing NEXT_PUBLIC_API_BASE_URL");
}

type FetchOptions = RequestInit & { json?: unknown };

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { json, headers, ...rest } = options;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      ...(json ? { "Content-Type": "application/json" } : {}),
      ...(headers ?? {}),
    },
    body: json ? JSON.stringify(json) : rest.body,
    credentials: "include", // 세션 쿠키 유지 핵심
    cache: "no-store",
  });

  if (!res.ok) {
    // 에러 메시지 파싱(있으면)
    let msg = `${res.status} ${res.statusText}`;
    try {
      const data = await res.json();
      if (data?.message) msg = data.message;
    } catch {}
    throw new Error(msg);
  }

  // 204/빈 응답 처리
  if (res.status === 204) return undefined as T;

  // JSON이 아닐 수도 있으니 안전하게
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}