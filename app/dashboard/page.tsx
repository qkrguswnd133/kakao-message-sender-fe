"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { me, logout, getKakaoStatus, kakaoUnlink } from "@/lib/auth-api";
import { KakaoLoginButton } from "@/components/kakao-login-button";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { LogOut, ChevronDown, Link2 } from "lucide-react";

type KakaoLinkStatus = "LINKED" | "NOT_LINKED" | "UNKNOWN";

export default function DashboardPage() {
  const router = useRouter();

  const [username, setUsername] = useState<string | null>(null);
  const [kakaoStatus, setKakaoStatus] = useState<KakaoLinkStatus>("UNKNOWN");

  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  const initials = useMemo(() => {
    if (!username) return "U";
    return username.slice(0, 2).toUpperCase();
  }, [username]);

  useEffect(() => {
    (async () => {
      try {
        const data = await me();
        setUsername(data.username);
        setRole(data.role);

        const s = await getKakaoStatus();
        setKakaoStatus(s.linked ? "LINKED" : "NOT_LINKED");
      } catch {
        router.replace("/login");
      }
    })();
  }, [router]);

  async function onConfirmLogout() {
    try {
      setLoggingOut(true);
      await logout();
      router.replace("/login");
    } finally {
      setLoggingOut(false);
      setLogoutOpen(false);
    }
  }

  if (!username) {
    return (
      <main className="min-h-screen grid place-items-center bg-neutral-100">
        <div className="text-sm text-neutral-600">Checking session...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-100 px-6">
      <div className="w-full max-w-sm rounded-xl bg-white shadow overflow-hidden">
        {/* 상단 옐로 바 */}
        <div className="h-2 w-full bg-[#FEE500]" />

        <div className="p-6 space-y-4">
          {/* 헤더: 타이틀 + 사용자 영역 드롭다운 */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-lg font-bold">Dashboard</h1>

              <div className="flex items-center gap-2">
                <p className="text-sm text-neutral-600">
                  Signed in as <span className="font-medium">{username}</span>
                </p>

                {/* 🟡 카카오 연결 상태 표시 */}
                <KakaoStatusBadge status={kakaoStatus} />
              </div>
            </div>

            {/* 👤 사용자 영역 드롭다운 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-yellow-50 transition">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-yellow-100 text-[#3C1E1E] font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-neutral-500" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs text-neutral-500">
                  Account
                </DropdownMenuLabel>
                <DropdownMenuItem className="flex items-center justify-between" disabled>
                  <span className="text-sm">{username}</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* 카카오 연결 상태에 따른 액션 */}
                { kakaoStatus === "LINKED" && (
                    <DropdownMenuItem
                        className="gap-2 text-red-600 focus:text-red-600"
                        onClick={async () => {
                        await kakaoUnlink();
                        setKakaoStatus("NOT_LINKED");
                        }}
                    >
                        <Link2 className="h-4 w-4" />
                        Disconnect Kakao
                    </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                {role === "ADMIN" && (
                <DropdownMenuItem onClick={() => router.push("/admin/users")}>
                    User Management
                </DropdownMenuItem>
                )}

                {/* 🔐 로그아웃 confirm 모달 트리거 */}
                <DropdownMenuItem
                  className="gap-2 text-red-600 focus:text-red-600"
                  onClick={() => setLogoutOpen(true)}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Separator />

          {/* 콘텐츠 */}
          <div className="space-y-3" id="kakao-connect">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold">Kakao</h2>
              <p className="text-xs text-neutral-600">
                Connect your Kakao account to sync friends and send messages.
              </p>
            </div>

            {/* 기존 카카오 버튼 재사용 */}
            <KakaoLoginButton />
          </div>
        </div>
      </div>

      {/* 🔐 로그아웃 확인 모달 */}
      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Log out?</DialogTitle>
            <DialogDescription>
              You will be signed out of this admin console. You can log back in anytime.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setLogoutOpen(false)}
              disabled={loggingOut}
            >
              Cancel
            </Button>

            <Button
              onClick={onConfirmLogout}
              disabled={loggingOut}
              className="bg-[#FEE500] text-[#3C1E1E] hover:bg-[#FDDC00]"
            >
              {loggingOut ? "Logging out..." : "Logout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function KakaoStatusBadge({ status }: { status: KakaoLinkStatus }) {
  if (status === "LINKED") {
    return (
      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
        카카오 계정 연결됨
      </Badge>
    );
  }
  if (status === "NOT_LINKED") {
    return (
      <Badge className="bg-yellow-100 text-[#3C1E1E] hover:bg-yellow-100">
        카카오 계정 미연결
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="text-neutral-600">
      확인 중…
    </Badge>
  );
}