"use client";

import React, { useState } from "react";
import type { ExerciseProps } from "./types";
import { sounds } from "@/lib/sound";
import { Check } from "lucide-react";

export function MatchPairs({
  exercise,
  onChange,
  disabled,
}: ExerciseProps) {
  const leftItems: string[] = exercise.data.left_items || [];
  const rightItems: string[] = exercise.data.right_items || [];

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);

  // Pairs successfully matched by the learner: { left: right }
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});
  const [wrongPair, setWrongPair] = useState<{ left: string; right: string } | null>(null);
  const [prevExerciseId, setPrevExerciseId] = useState(exercise.id);

  if (exercise.id !== prevExerciseId) {
    setPrevExerciseId(exercise.id);
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatchedPairs({});
    setWrongPair(null);
  }

  const handleSelectLeft = (item: string) => {
    if (disabled || matchedPairs[item]) return;
    sounds.playTap();
    setWrongPair(null);

    if (selectedRight) {
      const newMatched = { ...matchedPairs, [item]: selectedRight };
      setMatchedPairs(newMatched);
      onChange(Object.entries(newMatched).map(([left, right]) => ({ left, right })));
      setSelectedLeft(null);
      setSelectedRight(null);
    } else {
      setSelectedLeft((prev) => (prev === item ? null : item));
    }
  };

  const handleSelectRight = (item: string) => {
    if (disabled || Object.values(matchedPairs).includes(item)) return;
    sounds.playTap();
    setWrongPair(null);

    if (selectedLeft) {
      const newMatched = { ...matchedPairs, [selectedLeft]: item };
      setMatchedPairs(newMatched);
      onChange(Object.entries(newMatched).map(([left, right]) => ({ left, right })));
      setSelectedLeft(null);
      setSelectedRight(null);
    } else {
      setSelectedRight((prev) => (prev === item ? null : item));
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-3 duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-duo-text-dark tracking-tight">
          Tap the matching pairs
        </h2>
        <p className="text-xs font-bold text-gray-400 mt-1">
          {Object.keys(matchedPairs).length} of {leftItems.length} pairs matched
        </p>
      </div>

      {/* Two Columns Grid */}
      <div className="grid grid-cols-2 gap-4 pt-2">
        {/* Left Column (Source language) */}
        <div className="flex flex-col gap-3">
          {leftItems.map((item, idx) => {
            const isMatched = Boolean(matchedPairs[item]);
            const isSelected = selectedLeft === item;
            const isWrong = wrongPair?.left === item;

            return (
              <button
                key={idx}
                type="button"
                disabled={disabled || isMatched}
                onClick={() => handleSelectLeft(item)}
                className={[
                  "w-full p-4 rounded-2xl border-2 font-extrabold text-sm sm:text-base transition-all select-none text-left flex items-center justify-between",
                  isMatched
                    ? "border-duo-green bg-green-50 text-duo-green opacity-70 cursor-default"
                    : isWrong
                    ? "border-duo-red bg-red-50 text-duo-red animate-shake"
                    : isSelected
                    ? "border-duo-blue bg-blue-50 text-duo-blue border-b-4 translate-y-0.5"
                    : "border-[#e5e5e5] bg-white text-duo-text-dark hover:bg-gray-50 border-b-4 active:translate-y-1 active:border-b-2",
                ].join(" ")}
              >
                <span>{item}</span>
                {isMatched && <Check className="w-4 h-4 text-duo-green" />}
              </button>
            );
          })}
        </div>

        {/* Right Column (Target language) */}
        <div className="flex flex-col gap-3">
          {rightItems.map((item, idx) => {
            const isMatched = Object.values(matchedPairs).includes(item);
            const isSelected = selectedRight === item;
            const isWrong = wrongPair?.right === item;

            return (
              <button
                key={idx}
                type="button"
                disabled={disabled || isMatched}
                onClick={() => handleSelectRight(item)}
                className={[
                  "w-full p-4 rounded-2xl border-2 font-extrabold text-sm sm:text-base transition-all select-none text-left flex items-center justify-between",
                  isMatched
                    ? "border-duo-green bg-green-50 text-duo-green opacity-70 cursor-default"
                    : isWrong
                    ? "border-duo-red bg-red-50 text-duo-red animate-shake"
                    : isSelected
                    ? "border-duo-blue bg-blue-50 text-duo-blue border-b-4 translate-y-0.5"
                    : "border-[#e5e5e5] bg-white text-duo-text-dark hover:bg-gray-50 border-b-4 active:translate-y-1 active:border-b-2",
                ].join(" ")}
              >
                <span>{item}</span>
                {isMatched && <Check className="w-4 h-4 text-duo-green" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
