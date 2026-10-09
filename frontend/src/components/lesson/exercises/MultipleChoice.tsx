"use client";

import React, { useEffect, useMemo } from "react";
import type { ExerciseProps } from "./types";
import { sounds } from "@/lib/sound";
import { Volume2 } from "lucide-react";

export function MultipleChoice({
  exercise,
  value,
  onChange,
  disabled,
}: ExerciseProps) {
  const options = useMemo(
    () => (exercise.data.options as string[]) || [],
    [exercise.data.options]
  );
  const selected = typeof value === "string" ? value : "";

  // Support 1, 2, 3, 4 keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (disabled) return;
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= options.length) {
        sounds.playTap();
        onChange(options[num - 1]);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [disabled, options, onChange]);

  const handleSelect = (opt: string) => {
    if (disabled) return;
    sounds.playTap();
    onChange(opt);
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-start gap-6 animate-in fade-in slide-in-from-bottom-3 duration-200">
      {/* Exercise Prompt Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => sounds.playTap()}
          className="p-2.5 rounded-xl bg-duo-blue text-white hover:bg-duo-blue-dark active:scale-95 transition-all shadow-xs"
          aria-label="Listen to prompt"
        >
          <Volume2 className="w-5 h-5" />
        </button>
        <h2 className="text-xl sm:text-2xl font-black text-duo-text-dark tracking-tight">
          {exercise.prompt}
        </h2>
      </div>

      {/* Options List */}
      <div className="w-full flex flex-col gap-3 pt-2">
        {options.map((opt, idx) => {
          const isSelected = selected === opt;
          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => handleSelect(opt)}
              className={[
                "w-full flex items-center justify-between p-4 rounded-2xl border-2 border-b-4 font-extrabold text-base sm:text-lg transition-all select-none text-left",
                isSelected
                  ? "border-duo-blue bg-blue-50 dark:bg-[#1a334b] text-duo-blue border-b-4 translate-y-0.5"
                  : "border-[#e5e5e5] dark:border-[#2e3856] bg-white dark:bg-[#1a2c35] text-duo-text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-[#203642] active:translate-y-1 active:border-b-2",
                disabled ? "cursor-default" : "cursor-pointer",
              ].join(" ")}
            >
              <span className="font-extrabold dark:text-white">{opt}</span>

              {/* Number key badge hint */}
              <span
                className={[
                  "w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-black shrink-0 transition-colors",
                  isSelected
                    ? "border-duo-blue text-duo-blue bg-white dark:bg-[#1a334b]"
                    : "border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-300 bg-gray-50 dark:bg-[#203642]",
                ].join(" ")}
              >
                {idx + 1}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
