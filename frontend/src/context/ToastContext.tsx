"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast floating container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={[
              "pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl shadow-xl border-2 transition-all duration-200 animate-in slide-in-from-top-4",
              toast.type === "success"
                ? "bg-green-50 border-green-300 text-green-800"
                : toast.type === "error"
                ? "bg-red-50 border-red-300 text-red-800"
                : "bg-blue-50 border-blue-300 text-blue-800",
            ].join(" ")}
          >
            <div className="flex items-center gap-2.5 text-xs font-black">
              {toast.type === "success" && <CheckCircle2 className="w-4 h-4 text-duo-green" />}
              {toast.type === "error" && <AlertCircle className="w-4 h-4 text-duo-red" />}
              {toast.type === "info" && <Info className="w-4 h-4 text-duo-blue" />}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-gray-400 hover:text-gray-700 rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
