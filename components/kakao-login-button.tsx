"use client";

import { Button } from "@/components/ui/button";
import { getKakaoAuthorizeUrl } from "@/lib/kakao-api";

const KAKAO_YELLOW = "#FEE500";
const KAKAO_BROWN = "#3C1E1E";

export function KakaoLoginButton() {
  return (
    <Button
      type="button"
      onClick={async () => {
        const url = await getKakaoAuthorizeUrl();
        window.location.href = url;
      }}
      className="
        w-full h-12
        bg-[#FEE500] text-[#3C1E1E]
        font-semibold
        rounded-xl
        flex items-center justify-center gap-2
        shadow-sm
        hover:bg-[#FEE500]
        active:translate-y-[1px]
        active:shadow-inner
      "
    >
      <KakaoIcon />
      <span className="text-[15px] tracking-[-0.2px]">
        카카오로 로그인
      </span>
    </Button>
  );
}

function KakaoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path
        fill={KAKAO_BROWN}
        d="M12 3c-5.52 0-10 3.58-10 8
           0 2.72 1.72 5.12 4.36 6.56
           -.18.64-.66 2.32-.76 2.72
           -.12.48.17.48.36.35
           .15-.1 2.4-1.64 3.28-2.24
           .9.14 1.84.21 2.76.21
           5.52 0 10-3.58 10-8s-4.48-8-10-8z"
      />
    </svg>
  );
}