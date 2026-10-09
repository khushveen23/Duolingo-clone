/**
 * Card — white container with a 2px gray border and rounded-2xl corners.
 * Used throughout the app for panels, popovers, and info widgets.
 */

import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({
  children,
  className = "",
  padding = true,
  ...props
}: CardProps) {
  return (
    <div
      className={[
        "bg-white border-2 border-[#e5e5e5] rounded-2xl",
        padding ? "p-4" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
