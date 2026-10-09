"use client";

import React from "react";
import type { ExerciseProps } from "./types";
import { sounds } from "@/lib/sound";
import { Volume2 } from "lucide-react";

export function FillInBlank({
  exercise,
  value,
  onChange,
  disabled,
}: ExerciseProps) {
  const sentence = exercise.data.sentence || exercise.prompt || "";
  const options: string[] = exercise.data.options || [];
  const selected = typeof value === "string" ? value : "";

  // Split sentence around the blank placeholder "___"
  const parts = sentence.split("___");

  const handleSelect = (opt: string) => {
    if (disabled) return;
    sounds.playTap();
    onChange(opt);
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-3 duration-200">
      {/* Title */}
      <h2 className="text-xl sm:text-2xl font-black text-duo-text-dark tracking-tight">
        Fill in the blank
      </h2>

      {/* Sentence Box with Inline Pill Slot */}
      <div className="p-6 rounded-2xl bg-white border-2 border-[#e5e5e5] shadow-xs flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => sounds.playTap()}
          className="p-2 rounded-xl bg-duo-blue text-white hover:bg-duo-blue-dark active:scale-95 transition-all shrink-0"
          aria-label="Listen"
        >
          <Volume2 className="w-4 h-4" />
        </button>

        <div className="text-lg sm:text-xl font-extrabold text-duo-text-dark flex items-center gap-2 flex-wrap">
          {parts[0]}
          {/* Blank Slot Pill */}
          <span
            className={[
              "inline-flex items-center justify-center min-w-[90px] px-3 py-1 rounded-xl border-2 font-black transition-all",
              selected
                ? "border-duo-blue bg-blue-50 text-duo-blue"
                : "border-dashed border-gray-300 bg-gray-50 text-gray-300",
            ].join(" ")}
          >
            {selected || "..."}
          </span>
          {parts[1]}
        </div>
      </div>

      {exercise.data.translation && (
        <p className="text-xs font-bold text-gray-400 pl-1">
          {exercise.data.translation}
        </p>
      )}

      {/* Option Chips */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
        {options.map((opt, idx) => {
          const isSelected = selected === opt;
          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => handleSelect(opt)}
              className={[
                "px-5 py-3 rounded-2xl border-2 border-b-4 font-extrabold text-base transition-all select-none",
                isSelected
                  ? "border-duo-blue bg-blue-50 text-duo-blue border-b-4 translate-y-0.5"
                  : "border-[#e5e5e5] bg-white text-duo-text-dark hover:bg-gray-50 active:translate-y-1 active:border-b-2",
              ].join(" ")}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
