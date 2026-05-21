// components/Button.tsx

"use client";

import {ButtonHTMLAttributes, ReactNode} from "react";

type Variant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "success";

type Size = "sm" | "md" | "lg" | "icon";

type Width = "full" | "fit" | "auto";

type Radius = "sm" | "md" | "lg" | "full";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;

  loading?: boolean;

  leftIcon?: ReactNode;
  rightIcon?: ReactNode;

  variant?: Variant;

  size?: Size;

  width?: Width;

  onClick?: () => void;

  radius?: Radius;

  fullWidth?: boolean;
}

export default function Button({
  children,

  loading = false,

  disabled,

  leftIcon,
  rightIcon,

  variant = "primary",

  size = "md",

  width = "full",

  radius = "full",

  onClick,

  className = "",

  type = "button",

  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  // ─────────────────────────────────────────────
  // VARIANTS
  // ─────────────────────────────────────────────
  const variants: Record<Variant, string> = {
    primary: "bg-btn-primary text-white hover:opacity-90",

    secondary: "bg-muted/10 text-foreground hover:bg-muted/20",

    outline:
      "border border-muted/30 bg-transparent text-foreground hover:bg-muted/10",

    ghost: "bg-transparent text-foreground hover:bg-muted/10",

    danger: "bg-danger text-white hover:bg-red-600",

    success: "bg-green-500 text-white hover:bg-green-600",
  };

  // ─────────────────────────────────────────────
  // SIZES
  // ─────────────────────────────────────────────
  const sizes: Record<Size, string> = {
    sm: "px-3 py-2 text-sm",

    md: "px-4 py-2.5 text-sm",

    lg: "px-5 py-3 text-base",

    icon: "size-10 flex items-center justify-center",
  };

  // ─────────────────────────────────────────────
  // WIDTHS
  // ─────────────────────────────────────────────
  const widths: Record<Width, string> = {
    full: "w-full",

    fit: "w-fit",

    auto: "w-auto",
  };

  // ─────────────────────────────────────────────
  // RADIUS
  // ─────────────────────────────────────────────
  const radiuses: Record<Radius, string> = {
    sm: "rounded-md",

    md: "rounded-xl",

    lg: "rounded-2xl",

    full: "rounded-full",
  };

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center gap-2
        font-medium
        transition-all duration-200
        active:scale-[0.98]

        ${variants[variant]}
        ${sizes[size]}
        ${widths[width]}
        ${radiuses[radius]}

        ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}

        ${className}
      `}
      {...props}
    >
      {/* LEFT ICON */}
      {!loading && leftIcon}

      {/* CONTENT */}
      {loading ? "Loading..." : children}

      {/* RIGHT ICON */}
      {!loading && rightIcon}
    </button>
  );
}
