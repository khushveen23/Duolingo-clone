/**
 * Modal — a centered overlay dialog.
 * Closes when the backdrop is clicked, close button is pressed, or Escape key is pressed.
 */

"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  maxWidth?: string;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  maxWidth = "max-w-sm",
  className = "",
}: ModalProps) {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    // Backdrop — semi-transparent overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Dialog */}
      <div
        className={[
          "relative bg-white rounded-3xl shadow-2xl w-full mx-auto p-6",
          "animate-in fade-in zoom-in-95 duration-200 border-2 border-gray-100",
          maxWidth,
          className,
        ].join(" ")}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with optional title and close button */}
        <div className="flex items-center justify-between mb-3">
          {title ? (
            <h3 className="font-black text-lg text-duo-text-dark tracking-tight">
              {title}
            </h3>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
