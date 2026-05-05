"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@mcc/store";
import { User } from "@mcc/types";
import { saveSession } from "@mcc/features";

export default function GoogleSuccessPage() {
  const router = useRouter();
  const { setUser, setAccessToken } = useAuthStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const userParam = params.get("user");

    if (!accessToken || !refreshToken || !userParam) {
      router.replace("/login?error=google_auth_failed");
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userParam)) as User;
      saveSession(user, accessToken, refreshToken);
      setUser(user);
      setAccessToken(accessToken);
      router.replace(user.is_onboarded ? "/dashboard" : "/onboarding");
    } catch {
      router.replace("/login?error=google_auth_failed");
    }
  }, [router, setUser, setAccessToken]);

  return null;
}
