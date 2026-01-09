"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { exchangeKakaoCode } from "@/lib/kakao-api";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const sp = useSearchParams();

  useEffect(() => {
    (async () => {
      const code = sp.get("code");
      const state = sp.get("state");
      const error = sp.get("error");

      if (error) {
        router.replace("/dashboard");
        return;
      }
      if (!code || !state) {
        router.replace("/dashboard");
        return;
      }

      await exchangeKakaoCode(code, state);
      router.replace("/dashboard");
    })();
  }, [router, sp]);

  return (
    <main className="min-h-screen grid place-items-center bg-neutral-100">
      <div className="text-sm text-neutral-600">Completing Kakao login...</div>
    </main>
  );
}