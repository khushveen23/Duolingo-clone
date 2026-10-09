"use client";

import React, { useRef } from "react";
import type { ExerciseProps } from "./types";
import { sounds } from "@/lib/sound";
import { Volume2 } from "lucide-react";

const specialChars = ["á", "é", "í", "ó", "ú", "ñ", "¿", "¡"];

export function TypeAnswer({
  exercise,
  value,
  onChange,
  disabled,
}: ExerciseProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const text = typeof value === "string" ? value : "";

  const handleInsertChar = (char: string) => {
    if (disabled) return;
    sounds.playTap();
    const newText = text + char;
    onChange(newText);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-3 duration-200">
      {/* Title */}
      <h2 className="text-xl sm:text-2xl font-black text-duo-text-dark tracking-tight">
        Write this in English
      </h2>

      {/* Prompt Sentence */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-200">
        <button
          type="button"
          onClick={() => sounds.playTap()}
          className="p-2 rounded-xl bg-duo-blue text-white hover:bg-duo-blue-dark active:scale-95 transition-all shrink-0"
          aria-label="Listen"
        >
          <Volume2 className="w-4 h-4" />
        </button>
        <span className="text-lg font-extrabold text-duo-text-dark">
          {exercise.data.sentence_to_translate || exercise.prompt}
        </span>
      </div>

      {/* Textarea Input */}
      <div className="relative">
        <textarea
          ref={inputRef}
          disabled={disabled}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your translation here..."
          rows={3}
          className="w-full p-4 rounded-2xl border-2 border-[#e5e5e5] focus:border-duo-blue focus:bg-blue-50/20 text-base font-extrabold text-duo-text-dark outline-none resize-none transition-all placeholder:text-gray-400 placeholder:font-normal"
        />

        {/* Special Character Accent Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {specialChars.map((char) => (
            <button
              key={char}
              type="button"
              disabled={disabled}
              onClick={() => handleInsertChar(char)}
              className="w-9 h-9 rounded-xl border-2 border-b-3 border-[#e5e5e5] bg-white hover:bg-gray-100 active:translate-y-0.5 active:border-b font-extrabold text-sm text-duo-text-dark transition-all select-none"
            >
              {char}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
