"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@mcc/store";
import { User } from "@mcc/types";
import { loginApi, logoutApi } from "../services/auth.service";
import {
  saveSession,
  clearSession,
  getStoredUser,
  getStoredAccessToken,
} from "../services/session";

export const useAuth = () => {
  const { user, setUser, setAccessToken, logout } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!user) {
      const storedUser = getStoredUser();
      const storedToken = getStoredAccessToken();
      if (storedUser && storedToken) {
        setUser(storedUser);
        setAccessToken(storedToken);
      }
    }
    setHydrated(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginApi(email, password),
    onSuccess: (data) => {
      saveSession(data.user, data.access_token, data.refresh_token);
      setUser(data.user);
      setAccessToken(data.access_token);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSettled: () => {
      clearSession();
      logout();
    },
  });

  return {
    user: user as User | null,
    isAuthenticated: !!user,
    hydrated,
    loginMutation,
    logoutMutation,
  };
};
