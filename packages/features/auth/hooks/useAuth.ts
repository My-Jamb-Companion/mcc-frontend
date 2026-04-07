
"use client"

import { useEffect } from "react";
import { login, getCurrentUser } from "../services/auth.service";
import { Role } from "../types";
import { useAuthStore } from "@mcc/store/auth-store";

export const useAuth = () => {
  const { user, setUser, logout } = useAuthStore();

  useEffect(() => {
    if (!user) {
      getCurrentUser().then((res) => {
        if (res) setUser(res);
      });
    }
  }, []);

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