"use client";

import React from "react";
import type { SkillNode as SkillNodeType } from "@/types";
import { Lock, Crown, Star, Check, Sparkles } from "lucide-react";

interface SkillNodeProps {
  skill: SkillNodeType;
  index: number;
  isNextUp?: boolean;
  onSelect: (skill: SkillNodeType) => void;
}

// Sine wave offsets for the signature Duolingo path layout
// 0: center, 1: left, 2: center, 3: right, etc.
const horizontalOffsets = [
  "translate-x-0",
  "-translate-x-12 sm:-translate-x-16",
  "translate-x-0",
  "translate-x-12 sm:translate-x-16",
];

export function SkillNode({
  skill,
  index,
  isNextUp = false,
  onSelect,
}: SkillNodeProps) {
  const offsetClass = horizontalOffsets[index % horizontalOffsets.length];
  const isCompleted = skill.status === "completed";
  const isLocked = skill.status === "locked";
  const isAvailable = skill.status === "available";

  const progressPercent =
    skill.total_lessons > 0
      ? (skill.completed_lessons / skill.total_lessons) * 100
      : 0;

  return (
    <div
      className={`flex flex-col items-center justify-center my-4 transition-transform duration-200 ${offsetClass}`}
    >
      {/* "START" Tooltip Floating Bubble for the current active next skill */}
      {isNextUp && isAvailable && (
        <div className="relative mb-2 animate-bounce">
          <div className="bg-white border-2 border-[#e5e5e5] px-3 py-1 rounded-xl shadow-md text-xs font-black uppercase tracking-wider text-duo-green flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 fill-duo-green" />
            <span>START</span>
          </div>
          {/* Arrow pointing down */}
          <div className="w-2.5 h-2.5 bg-white border-r-2 border-b-2 border-[#e5e5e5] rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2" />
        </div>
      )}

      {/* Circular Button Container with SVG Progress Ring */}
      <div className="relative flex items-center justify-center">
        {/* SVG Progress Ring for active node */}
        {isAvailable && !isCompleted && progressPercent > 0 && (
          <svg
            className="absolute -inset-2.5 w-[88px] h-[88px] -rotate-90 pointer-events-none"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-gray-200"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-duo-yellow transition-all duration-500 ease-out"
              strokeWidth="6"
              strokeDasharray={276.46}
              strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
        )}

        {/* 3D Round Node Button */}
        <button
          onClick={() => onSelect(skill)}
          disabled={isLocked}
          aria-label={`${skill.title} - ${skill.status}`}
          className={[
            "relative w-18 h-18 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-100 select-none",
            isLocked
              ? "bg-gray-200 border-b-6 border-gray-300 cursor-not-allowed opacity-90"
              : isCompleted
              ? "bg-duo-yellow border-b-6 border-duo-yellow-dark hover:brightness-105 active:border-b-0 active:translate-y-1.5 shadow-lg"
              : "bg-duo-green border-b-6 border-duo-green-dark hover:brightness-105 active:border-b-0 active:translate-y-1.5 shadow-lg",
          ].join(" ")}
        >
          {/* Inner Node Icon */}
          {isLocked ? (
            <Lock className="w-8 h-8 text-gray-400" strokeWidth={2.5} />
          ) : isCompleted ? (
            <Crown className="w-9 h-9 text-white fill-white" />
          ) : (
            <Star className="w-9 h-9 text-white fill-white" />
          )}

          {/* Level / Crown Badge on Completed or Active */}
          {isCompleted && (
            <div className="absolute -bottom-1 -right-1 bg-duo-yellow-dark text-white rounded-full p-1 border-2 border-white shadow-xs">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          )}
        </button>
      </div>

      {/* Skill Title Below */}
      <span
        className={[
          "mt-2 text-xs font-black tracking-tight text-center max-w-[110px] truncate select-none",
          isLocked
            ? "text-gray-400"
            : isCompleted
            ? "text-duo-yellow-dark"
            : "text-duo-text-dark",
        ].join(" ")}
      >
        {skill.title}
      </span>
    </div>
  );
}
