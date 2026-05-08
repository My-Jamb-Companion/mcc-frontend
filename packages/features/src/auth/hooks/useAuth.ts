"use client";

import {useEffect, useState} from "react";
import {useMutation} from "@tanstack/react-query";
import {useAuthStore} from "@mcc/store";
import {tokenManager} from "@mcc/api";
import {User} from "@mcc/types";
import {loginApi, logoutApi, refreshTokenApi} from "../services/auth.service";
import {
  saveSession,
  clearSession,
  getStoredUser,
  getStoredRefreshToken,
} from "../services/session";

export const useAuth = () => {
  const {user, setUser, setAccessToken, logout} = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (user) {
      setHydrated(true);
      return;
    }

    const hasCookie = document.cookie.includes("mcc_auth=1");
    const storedUser = getStoredUser();
    const refreshToken = getStoredRefreshToken();

    if (hasCookie && storedUser && refreshToken) {
      // Restore user immediately so the UI doesn't flash as logged-out.
      setUser(storedUser);

      // Proactively refresh the access token using the stored refresh token.
      // On failure, swallow — the response interceptor will handle 401s on
      // real API calls and redirect to /login if the session is truly invalid.
      refreshTokenApi(refreshToken)
        .then(({access_token}) => {
          tokenManager.set(access_token);
          setAccessToken(access_token);
        })
        .catch(() => {
          // Swallow — interceptor handles session expiry on next API call.
        })
        .finally(() => setHydrated(true));
    } else {
      setHydrated(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loginMutation = useMutation({
    mutationFn: ({email, password}: {email: string; password: string}) =>
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
    isLoading: !hydrated,
    loginMutation,
    logoutMutation,
  };
};
