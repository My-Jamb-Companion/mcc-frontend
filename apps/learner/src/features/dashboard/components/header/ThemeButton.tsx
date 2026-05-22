"use client";

import {useEffect, useState} from "react";
import {Icon} from "@mcc/ui";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  const saved = localStorage.getItem("theme") as Theme | null;
  const system: Theme = window.matchMedia("(prefers-color-scheme: dark)")
    .matches
    ? "dark"
    : "light";
  return saved ?? system;
}

export default function ThemeButton() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    return getInitialTheme();
  });

  const applyTheme = (t: Theme) => {
    document.documentElement.classList.toggle("dark", t === "dark");
    localStorage.setItem("theme", t);
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggle = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      // Only follow system if user hasn't manually set a preference
      if (!localStorage.getItem("theme")) {
        const next: Theme = e.matches ? "dark" : "light";
        setTheme(next);
        applyTheme(next);
      }
    };

    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  return (
    <div className="flex items-center max-sm:hidden">
      <button
        onClick={toggle}
        aria-label="Switch to dark mode"
        className={`rounded-full p-2 transition-colors cursor-pointer ${
          theme === "light"
            ? "bg-btn-primary text-white"
            : "bg-transparent text-foreground"
        }`}
      >
        <Icon icon="solar:sun-bold-duotone" size={24}/>
      </button>
      <button
        onClick={toggle}
        aria-label="Switch to light mode"
        className={`rounded-full p-2 transition-colors cursor-pointer ${
          theme === "dark"
            ? "bg-btn-primary text-white"
            : "bg-transparent text-foreground"
        }`}
      >
        <Icon icon="solar:moon-bold" size={24}/>
      </button>
    </div>
  );
}