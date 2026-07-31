"use client";

import * as React from "react";
import {cva, type VariantProps} from "class-variance-authority";
import {cn} from "../lib/cn";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "whitespace-nowrap select-none",
    "font-medium",
    "transition-all duration-200 ease-out",
    "focus-visible:outline-none",
    "focus-visible:ring-2 focus-visible:ring-btn-primary/30",
    "disabled:pointer-events-none disabled:opacity-60",
    "active:scale-[0.98]",
    "transistions-all duration-300",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: "bg-btn-primary text-white hover:opacity-90 active:opacity-80",

        secondary: "bg-muted/20 text-subtle/50 hover:bg-muted/30",

        outline: "border border-muted/40 bg-transparent hover:bg-muted/10",

        ghost: "bg-transparent hover:bg-muted/20 text-subtle",

        danger: "bg-danger text-white hover:bg-red-600",

        dangerOutline:
          "bg-red-50 text-danger hover:bg-danger hover:text-white border border-danger",

        success: "bg-green-600 text-white hover:bg-green-700",

        successOutline:
          "bg-green-50 text-success hover:bg-success hover:text-white border border-success",
      },

      size: {
        fit: "h-auto w-fit",

        xs: "h-8 px-3 text-xs",

        sm: "h-9 px-4 text-sm",

        md: "h-11 px-5 text-sm",

        lg: "h-12 px-6 text-base",

        xl: "h-14 px-7 text-lg",

        icon: "size-11",
      },

      radius: {
        none: "rounded-none",

        sm: "rounded-md",

        md: "rounded-xl",

        lg: "rounded-2xl",

        xl: "rounded-3xl",

        full: "rounded-full",
      },

      width: {
        full: "w-full",

        fit: "w-fit",
      },
    },

    defaultVariants: {
      variant: "primary",

      size: "md",

      radius: "full",

      width: "fit",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;

  loadingText?: string;

  loader?: React.ReactNode;

  leftIcon?: React.ReactNode;

  rightIcon?: React.ReactNode;
}

export function Button({
  children,

  className,

  variant,

  size,

  radius,

  width,

  loading = false,

  loadingText = "Loading...",

  loader,

  leftIcon,

  rightIcon,

  disabled,

  type = "button",

  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      className={cn(
        buttonVariants({
          variant,
          size,
          radius,
          width,
        }),
        className,
      )}
      {...props}
    >
      {!loading && leftIcon}

      {loading ? (
        <>
          {loader ?? (
            <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}

          {loadingText}
        </>
      ) : (
        children
      )}

      {!loading && rightIcon}
    </button>
  );
}

Button.displayName = "Button";

export {buttonVariants};
