"use client";

import { ReactNode, useEffect } from "react";
import { useThemeStore } from "@mcc/store";


type ThemeProviderProps = {
  children: ReactNode;
};


export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { setTheme } = useThemeStore();

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark";

    if (saved) {
      setTheme(saved);
    } else {
      setTheme("light");
    }
  }, [setTheme]);

  return children;
};