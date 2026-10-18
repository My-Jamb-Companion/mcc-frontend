"use client";

import {Icon} from "@mcc/ui";
import {useThemeStore} from "@mcc/store";

export default function ThemeButton() {
  const {theme, setTheme} = useThemeStore();
  const dark = theme === "dark";

  return (
    <>
    {/* Phones have no room for the pair, so one button flips between the two. */}
    <button
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="shrink-0 rounded-full bg-btn-primary p-2 text-white sm:hidden"
    >
      <Icon icon={dark ? "solar:sun-bold-duotone" : "solar:moon-bold"} size={20} />
    </button>
    <div className="flex items-center max-sm:hidden">
      <button
        onClick={() => setTheme("light")}
        aria-label="Switch to light mode"
        className={`rounded-full p-2 transition-colors cursor-pointer ${
          theme === "light"
            ? "bg-btn-primary text-white"
            : "bg-transparent text-foreground"
        }`}
      >
        <Icon icon="solar:sun-bold-duotone" size={24} />
      </button>
      <button
        onClick={() => setTheme("dark")}
        aria-label="Switch to dark mode"
        className={`rounded-full p-2 transition-colors cursor-pointer ${
          theme === "dark"
            ? "bg-btn-primary text-white"
            : "bg-transparent text-foreground"
        }`}
      >
        <Icon icon="solar:moon-bold" size={24} />
      </button>
    </div>
    </>
  );
}
