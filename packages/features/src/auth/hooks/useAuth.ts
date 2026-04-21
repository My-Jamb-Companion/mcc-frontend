"use client";

import { useEffect } from "react";
import { login, getCurrentUser } from "../services/auth.service";
import { Role } from "../types";
import { useAuthStore } from "@mcc/store";
import { User } from "@mcc/types";

type UseAuthReturn = {
  user: User | null;
  login: (role: Role) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

export const useAuth = (): UseAuthReturn => {
  const { user, setUser, logout } = useAuthStore();

  useEffect(() => {
    if (!user) {
      getCurrentUser().then((res) => {
        if (res) setUser(res);
      });
    }
  }, [user, setUser]);

  const handleLogin = async (role: Role) => {
    const user = await login(role);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    logout();
  };

  return {
    user,
    login: handleLogin,
    logout: handleLogout,
    isAuthenticated: !!user,
  };
};
