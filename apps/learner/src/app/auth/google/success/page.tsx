"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@mcc/store";
import { User, Role } from "@mcc/types";
import { saveSession } from "@mcc/features";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function parseUserParam(raw: string): User | null {
  try { return JSON.parse(raw) as User; } catch { /* fall through */ }
  try { return JSON.parse(decodeURIComponent(raw)) as User; } catch { /* fall through */ }
  try { return JSON.parse(atob(raw)) as User; } catch { /* fall through */ }
  return null;
}

export default function GoogleSuccessPage() {
  const router = useRouter();
  const { setUser, setAccessToken } = useAuthStore();

  useEffect(() => {
    // ── Source 1: tokens as URL query params (forwarded by middleware) ──────────
    const params = new URLSearchParams(window.location.search);
    let accessToken = params.get("access_token");
    let refreshToken = params.get("refresh_token");
    const userParam = params.get("user");

    // ── Source 2: tokens set as cookies by the backend after OAuth ────────────
    if (!accessToken) accessToken = getCookie("access_token");
    if (!refreshToken) refreshToken = getCookie("refresh_token");

    if (!accessToken || !refreshToken) {
      router.replace("/login?error=google_auth_failed");
      return;
    }

    // ── Resolve user: from URL param → individual params → JWT decode ─────────
    let user: User | null = null;

    if (userParam) {
      user = parseUserParam(userParam);
    }

    if (!user) {
      const payload = decodeJwtPayload(accessToken);
      if (payload) {
        user = {
          user_id: (payload.sub as string) ?? "",
          email: (payload.email as string) ?? "",
          role: (payload.role as Role) ?? "student",
          is_onboarded: (payload.is_onboarded as boolean) ?? false,
        };
      }
    }

    if (!user) {
      router.replace("/login?error=google_auth_failed");
      return;
    }

    // Clear the OAuth cookies the backend left so they don't interfere later
    document.cookie = "access_token=; path=/; max-age=0";
    document.cookie = "refresh_token=; path=/; max-age=0";
    document.cookie = "oauth_origin=; path=/; max-age=0";

    saveSession(user, accessToken, refreshToken);
    setUser(user);
    setAccessToken(accessToken);
    router.replace(user.is_onboarded ? "/dashboard" : "/onboarding");
  }, [router, setUser, setAccessToken]);

  return null;
}
