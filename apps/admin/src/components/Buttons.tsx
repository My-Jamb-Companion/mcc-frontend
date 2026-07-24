"use client";

import {ButtonHTMLAttributes, ReactNode, forwardRef} from "react";

// Helper function to combine class names without external libraries
function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
export type Variant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "success";

export type Size = "sm" | "md" | "lg" | "icon";
export type Width = "full" | "fit" | "auto";
export type Radius = "none" | "sm" | "md" | "lg" | "full";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  loading?: boolean;
  loader?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  variant?: Variant;
  size?: Size;
  width?: Width;
  radius?: Radius;
}

// ─────────────────────────────────────────────
// MAPS
// ─────────────────────────────────────────────
const variantStyles: Record<Variant, string> = {
  primary: "bg-btn-primary text-white hover:opacity-90 active:opacity-100",
  secondary: "bg-muted/30 text-foreground hover:bg-muted/50 active:bg-muted/60",
  outline:
    "border border-muted/30 text-foreground bg-transparent hover:bg-muted/20 active:bg-muted/30",
  ghost: "bg-transparent text-foreground hover:bg-muted/20 active:bg-muted/30",
  danger: "bg-danger text-white hover:bg-red-600 active:bg-red-700",
  success: "bg-green-600 text-white hover:bg-green-700 active:bg-green-800",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2.5",
  icon: "size-10 p-0 flex items-center justify-center shrink-0",
};

const widthStyles: Record<Width, string> = {
  full: "w-full",
  fit: "w-fit",
  auto: "w-auto",
};

const radiusStyles: Record<Radius, string> = {
  none: "rounded-none",
  sm: "rounded-md",
  md: "rounded-xl",
  lg: "rounded-2xl",
  full: "rounded-full",
};

function DefaultSpinner() {
  return (
    <svg
      className="animate-spin size-4 text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      loading = false,
      loader,
      disabled,
      leftIcon,
      rightIcon,
      variant = "primary",
      size = "md",
      width = "auto",
      radius = "full",
      className = "",
      type = "button",
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center font-medium select-none align-middle whitespace-nowrap shrink-0",
          "transition-all duration-150 ease-in-out",
          // Focus state
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          // Active state
          "active:scale-[0.98]",
          // Disabled state using standard Tailwind modifiers
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:active:scale-100",
          // Variant / Size / Width / Radius
          variantStyles[variant],
          sizeStyles[size],
          widthStyles[width],
          radiusStyles[radius],
          // Custom overrides
          className,
        )}
        {...props}
      >
        {loading && (loader || <DefaultSpinner />)}

        {!loading && leftIcon && (
          <span className="shrink-0 inline-flex items-center">{leftIcon}</span>
        )}

        {children && <span>{children}</span>}

        {!loading && rightIcon && (
          <span className="shrink-0 inline-flex items-center">{rightIcon}</span>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
