"use client";

import React, { useState } from "react";
import type { ExerciseProps } from "./types";
import { AnimatedCharacter } from "../AnimatedCharacter";
import { sounds } from "@/lib/sound";
import { Volume2 } from "lucide-react";

interface WordItem {
  id: string;
  text: string;
}

export function TranslateWordBank({
  exercise,
  onChange,
  disabled,
}: ExerciseProps) {
  const rawWords: string[] = exercise.data.word_bank || [];

  // Determine character based on prompt context (Chef for food/cooking, Kung Fu Bird for action/other)
  const promptLower = (exercise.prompt || "").toLowerCase();
  const isFoodRelated =
    promptLower.includes("eat") ||
    promptLower.includes("drink") ||
    promptLower.includes("bread") ||
    promptLower.includes("apple") ||
    promptLower.includes("water") ||
    promptLower.includes("food") ||
    promptLower.includes("pan") ||
    promptLower.includes("agua") ||
    promptLower.includes("manzana") ||
    promptLower.includes("come") ||
    promptLower.includes("bebe");

  const character = isFoodRelated ? "chef" : "kung-fu-bird";

  // Placed words in top answer slot
  const [selectedWords, setSelectedWords] = useState<WordItem[]>([]);
  const [prevExerciseId, setPrevExerciseId] = useState(exercise.id);

  if (exercise.id !== prevExerciseId) {
    setPrevExerciseId(exercise.id);
    setSelectedWords([]);
  }

  // When word is tapped from bank to answer
  const handleAddWord = (item: WordItem) => {
    if (disabled) return;
    sounds.playTap();
    const nextSelected = [...selectedWords, item];
    setSelectedWords(nextSelected);
    onChange(nextSelected.map((w) => w.text));
  };

  // When word is tapped from answer back to bank
  const handleRemoveWord = (item: WordItem) => {
    if (disabled) return;
    sounds.playTap();
    const nextSelected = selectedWords.filter((w) => w.id !== item.id);
    setSelectedWords(nextSelected);
    onChange(nextSelected.map((w) => w.text));
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-3 duration-200">
      {/* Title */}
      <h2 className="text-xl sm:text-2xl font-black text-duo-text-dark tracking-tight">
        Translate this sentence
      </h2>

      {/* Mascot with Speech Bubble */}
      <div className="flex items-center gap-3 sm:gap-4 my-2">
        <div className="w-24 h-24 shrink-0 flex items-center justify-center">
          <AnimatedCharacter character={character} size={100} />
        </div>

        {/* Speech Bubble */}
        <div className="relative bg-white border-2 border-[#e5e5e5] rounded-2xl p-4 shadow-xs flex items-center gap-3 flex-1">
          {/* Bubble triangle pointer */}
          <div className="absolute top-5 -left-2 w-3.5 h-3.5 bg-white border-l-2 border-b-2 border-[#e5e5e5] rotate-45" />

          <button
            type="button"
            onClick={() => sounds.playTap()}
            className="p-1.5 rounded-lg bg-duo-blue text-white hover:bg-duo-blue-dark active:scale-95 transition-all shrink-0"
            aria-label="Listen"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          <span className="text-base sm:text-lg font-extrabold text-duo-text-dark">
            {exercise.prompt}
          </span>
        </div>
      </div>

      {/* Answer Slots Area (Top) */}
      <div className="min-h-[100px] border-b-2 border-t-2 border-gray-200 py-3 flex flex-wrap items-center content-start gap-2 bg-gray-50/50 rounded-xl px-3">
        {selectedWords.length === 0 ? (
          <span className="text-xs font-bold text-gray-400 select-none italic pl-1">
            Tap the word tiles below to form your translation...
          </span>
        ) : (
          selectedWords.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={disabled}
              onClick={() => handleRemoveWord(item)}
              className="px-3.5 py-2 rounded-xl bg-white border-2 border-b-4 border-[#e5e5e5] font-extrabold text-sm sm:text-base text-duo-text-dark shadow-xs hover:bg-gray-50 active:translate-y-0.5 active:border-b-2 transition-all select-none animate-in zoom-in-95 duration-100"
            >
              {item.text}
            </button>
          ))
        )}
      </div>

      {/* Available Word Bank Tiles (Bottom) */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
        {rawWords.map((word, i) => {
          const id = `${word}-${i}`;
          const isUsed = selectedWords.some((w) => w.id === id);

          return isUsed ? (
            // Placeholder slot when tile is in the answer area
            <div
              key={id}
              className="px-3.5 py-2 rounded-xl bg-gray-200/80 border-2 border-gray-200 text-transparent font-extrabold text-sm sm:text-base select-none pointer-events-none"
            >
              {word}
            </div>
          ) : (
            // Active word tile
            <button
              key={id}
              type="button"
              disabled={disabled}
              onClick={() => handleAddWord({ id, text: word })}
              className="px-3.5 py-2 rounded-xl bg-white border-2 border-b-4 border-[#e5e5e5] font-extrabold text-sm sm:text-base text-duo-text-dark shadow-sm hover:bg-gray-50 hover:border-gray-300 active:translate-y-1 active:border-b-2 transition-all select-none cursor-pointer"
            >
              {word}
            </button>
          );
        })}
      </div>
    </div>
  );
}
