"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@mcc/store";
import { googleExchangeApi, saveSession } from "@mcc/features";

export default function GoogleSuccessPage() {
  const router = useRouter();
  const { setUser, setAccessToken } = useAuthStore();
  const exchanged = useRef(false);

  useEffect(() => {
    if (exchanged.current) return;
    exchanged.current = true;

    const code = new URLSearchParams(window.location.search).get("code");

    if (!code) {
      console.error("[GoogleSuccess] No code param in URL:", window.location.href);
      router.replace("/login?error=no_code");
      return;
    }

    console.log("[GoogleSuccess] Exchanging code:", code.slice(0, 10) + "...");

    googleExchangeApi(code)
      .then(({ user, access_token, redirect_url }) => {
        saveSession(user, access_token);
        setUser(user);
        setAccessToken(access_token);
        router.replace(redirect_url ?? (user.is_onboarded ? "/dashboard" : "/onboarding"));
      })
      .catch((err) => {
        const status = err?.response?.status;
        const detail = err?.response?.data?.message ?? err?.message ?? "unknown";
        console.error("[GoogleSuccess] Exchange failed:", status, detail);
        router.replace(`/login?error=exchange_failed&status=${status}&detail=${encodeURIComponent(detail)}`);
      });
  }, [router, setUser, setAccessToken]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}
