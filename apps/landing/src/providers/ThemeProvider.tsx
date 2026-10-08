"use client";

import { ReactNode, useEffect } from "react";
import { useThemeStore } from "@mcc/store";

type ThemeProviderProps = {
  children: ReactNode;
};

// Browsers can refuse storage access (private modes, blocked third-party storage); the theme then just follows the OS.
const readSavedTheme = (): "light" | "dark" | null => {
  try {
    return localStorage.getItem("theme") as "light" | "dark" | null;
  } catch {
    return null;
  }
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { setTheme, applyTheme } = useThemeStore();

  useEffect(() => {
    const saved = readSavedTheme();

    if (saved) {
      setTheme(saved);
      return;
    }

    // No explicit choice saved yet -- follow the OS preference without
    // persisting it, so a live OS change keeps being reflected.
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    applyTheme(mq.matches ? "dark" : "light");

    const handleChange = (e: MediaQueryListEvent) => {
      if (!readSavedTheme()) {
        applyTheme(e.matches ? "dark" : "light");
      }
    };
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, [setTheme, applyTheme]);

  return children;
};
