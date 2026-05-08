"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@mcc/store";
import { facebookExchangeApi, saveSession } from "@mcc/features";

export default function FacebookSuccessPage() {
  const router = useRouter();
  const { setUser, setAccessToken } = useAuthStore();
  const exchanged = useRef(false);

  useEffect(() => {
    if (exchanged.current) return;
    exchanged.current = true;

    const code = new URLSearchParams(window.location.search).get("code");

    if (!code) {
      router.replace("/login?error=no_code");
      return;
    }

    facebookExchangeApi(code)
      .then(({ user, access_token, refresh_token, redirect_url }) => {
        saveSession(user, access_token, refresh_token);
        setUser(user);
        setAccessToken(access_token);
        const destination = redirect_url
          ? new URL(redirect_url).pathname
          : (user.is_onboarded ? "/dashboard" : "/onboarding");
        router.replace(destination);
      })
      .catch((err) => {
        const status = err?.response?.status;
        const detail = err?.response?.data?.message ?? err?.message ?? "unknown";
        router.replace(`/login?error=exchange_failed&status=${status}&detail=${encodeURIComponent(detail)}`);
      });
  }, [router, setUser, setAccessToken]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}
