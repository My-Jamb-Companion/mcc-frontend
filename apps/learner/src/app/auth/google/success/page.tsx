"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@mcc/store";
import { User } from "@mcc/types";

export default function GoogleSuccessPage() {
  const router = useRouter();
  const { setUser, setAccessToken } = useAuthStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const userParam = params.get("user");

    if (accessToken && refreshToken && userParam) {
      const user = JSON.parse(decodeURIComponent(userParam)) as User;
      localStorage.setItem("mcc_access_token", accessToken);
      localStorage.setItem("mcc_refresh_token", refreshToken);
      localStorage.setItem("mcc_user", JSON.stringify(user));
      document.cookie = "mcc_auth=1; path=/; SameSite=Strict; max-age=86400";
      setUser(user);
      setAccessToken(accessToken);
    } else {
      // Backend set httpOnly cookies — just set the presence cookie and proceed
      document.cookie = "mcc_auth=1; path=/; SameSite=Strict; max-age=86400";
    }

    router.replace("/dashboard");
  }, [router, setUser, setAccessToken]);

  return null;
}
