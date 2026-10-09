/**
 * Button — the signature Duolingo 3D button component.
 *
 * Variants:
 *   primary / green   — green #58cc02 (used for CTA actions)
 *   secondary         — white with gray border
 *   blue              — blue #1cb0f6
 *   yellow            — yellow #ffc800
 *   danger            — red #ff4b4b
 *   locked            — gray, disabled state
 */

import React from "react";

export type Variant =
  | "primary"
  | "secondary"
  | "blue"
  | "green"
  | "yellow"
  | "danger"
  | "locked";

export type Size = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-duo-green text-white border-b-4 border-duo-green-dark hover:bg-duo-green/90 active:border-b-0 active:translate-y-1",
  green:
    "bg-duo-green text-white border-b-4 border-duo-green-dark hover:bg-duo-green/90 active:border-b-0 active:translate-y-1",
  secondary:
    "bg-white text-duo-green border-2 border-b-4 border-gray-200 hover:bg-gray-50 active:border-b-2 active:translate-y-0.5",
  blue:
    "bg-duo-blue text-white border-b-4 border-duo-blue-dark hover:bg-duo-blue/90 active:border-b-0 active:translate-y-1",
  yellow:
    "bg-duo-yellow text-duo-yellow-dark border-b-4 border-amber-600 hover:bg-yellow-400 active:border-b-0 active:translate-y-1",
  danger:
    "bg-duo-red text-white border-b-4 border-duo-red-dark hover:bg-duo-red/90 active:border-b-0 active:translate-y-1",
  locked:
    "bg-gray-200 text-gray-400 border-b-4 border-gray-300 cursor-not-allowed",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  const isLocked = variant === "locked" || disabled;

  return (
    <button
      disabled={isLocked}
      className={[
        "rounded-2xl font-extrabold uppercase tracking-wider",
        "transition-all duration-75 select-none cursor-pointer",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        isLocked ? variantStyles.locked : variantStyles[variant],
        sizeStyles[size],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
