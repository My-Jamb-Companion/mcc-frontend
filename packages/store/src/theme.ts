import { create } from "zustand";

type Theme = "light" | "dark";

type ThemeState = {
  theme: Theme;
  /** Explicit user choice: persists to localStorage and updates the DOM. */
  setTheme: (theme: Theme) => void;
  /** Explicit user choice: flips the theme, persists, and updates the DOM. */
  toggleTheme: () => void;
  /**
   * System-derived default: updates the DOM but deliberately does NOT
   * persist. Used on mount to follow the OS preference when the user
   * hasn't made an explicit choice yet -- persisting here would make a
   * one-time system snapshot look like a saved user choice and silently
   * stop the app from following further OS-level changes.
   */
  applyTheme: (theme: Theme) => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "light",

  setTheme: (theme) => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    set({ theme });
  },

  toggleTheme: () =>
    set((state) => {
      const next = state.theme === "light" ? "dark" : "light";
      localStorage.setItem("theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return { theme: next };
    }),

  applyTheme: (theme) => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    set({ theme });
  },
}));
