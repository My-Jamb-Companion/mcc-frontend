"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@mcc/store";
import { User } from "@mcc/types";
import { saveSession } from "@mcc/features";

function parseUser(raw: string): User | null {
  // URLSearchParams.get() already URL-decodes — try direct parse first
  try {
    return JSON.parse(raw) as User;
  } catch { /* fall through */ }

  // Some backends double-encode; try decoding once more
  try {
    return JSON.parse(decodeURIComponent(raw)) as User;
  } catch { /* fall through */ }

  // Base64-encoded JSON
  try {
    return JSON.parse(atob(raw)) as User;
  } catch { /* fall through */ }

  return null;
}

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

    const user = parseUser(userParam);
    if (!user) {
      router.replace("/login?error=google_auth_failed");
      return;
    }

    saveSession(user, accessToken, refreshToken);
    setUser(user);
    setAccessToken(accessToken);
    router.replace(user.is_onboarded ? "/dashboard" : "/onboarding");
  }, [router, setUser, setAccessToken]);

  return null;
}
