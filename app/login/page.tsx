"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { login } from "@/lib/auth-api";

/* 카카오 컬러 */
const KAKAO_YELLOW = "#FEE500";
const KAKAO_BROWN = "#3C1E1E";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => username.trim().length > 0 && password.length > 0 && !loading,
    [username, password, loading]
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(username, password);
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#FFF7CC] to-[#FFFDF2] px-6">
      <Card className="relative w-full max-w-sm overflow-hidden border-none shadow-xl">
        {/* 카카오 옐로 바 */}
        <div
          className="absolute top-0 left-0 h-2 w-full"
          style={{ backgroundColor: KAKAO_YELLOW }}
        />

        <CardHeader className="space-y-2 text-center pt-6">
          <CardTitle
            className="text-2xl font-extrabold"
            style={{ color: KAKAO_BROWN }}
          >
            Kakao Message Sender
          </CardTitle>
          <p className="text-sm" style={{ color: `${KAKAO_BROWN}B3` }}>
            Sign in to access the Kakao console
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-1">
              <label
                className="text-xs font-medium"
                style={{ color: `${KAKAO_BROWN}CC` }}
              >
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="pl-9 focus-visible:ring-[#FEE500]"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label
                className="text-xs font-medium"
                style={{ color: `${KAKAO_BROWN}CC` }}
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <Input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 pr-10 focus-visible:ring-[#FEE500]"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-neutral-400 hover:text-neutral-700"
                >
                  {showPw ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* ✅ Login Button + Kakao Icon */}
            <Button
              type="submit"
              disabled={!canSubmit}
              className="
                w-full font-semibold
                flex items-center justify-center gap-2
                text-[#3C1E1E]
                bg-[#FEE500]
                hover:bg-[#FDDC00]
                active:translate-y-[1px]
              "
            >
              <KakaoBubbleIcon />
              {loading ? "Signing in..." : "Login"}
            </Button>
          </form>
        </CardContent>

        <CardFooter
          className="justify-center text-xs"
          style={{ color: `${KAKAO_BROWN}99` }}
        >
          Personal Kakao console
        </CardFooter>
      </Card>
    </main>
  );
}

/* 카카오 말풍선 아이콘 (SVG, 브랜드 유사 스타일) */
function KakaoBubbleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden
      fill="none"
    >
      <path
        d="M12 3C6.48 3 2 6.58 2 11c0 2.73 1.73 5.14 4.38 6.58
           -.18.64-.63 2.22-.72 2.58
           -.11.46.17.45.35.33
           .14-.1 2.27-1.54 3.19-2.17
           .9.13 1.84.2 2.8.2
           5.52 0 10-3.58 10-8s-4.48-8-10-8Z"
        fill={KAKAO_BROWN}
      />
    </svg>
  );
}