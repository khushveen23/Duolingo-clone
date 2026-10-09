"use client";

import React from "react";
import { BookOpen } from "lucide-react";
import type { UnitData } from "@/types";

interface UnitHeaderProps {
  unit: UnitData;
  unitIndex: number;
}

// Unit theme palettes
const unitColors = [
  { bg: "bg-duo-green", border: "border-duo-green-dark", text: "text-white" },
  { bg: "bg-duo-blue", border: "border-duo-blue-dark", text: "text-white" },
  { bg: "bg-duo-purple", border: "border-duo-purple-dark", text: "text-white" },
  { bg: "bg-duo-orange", border: "border-duo-orange-dark", text: "text-white" },
];

export function UnitHeader({ unit, unitIndex }: UnitHeaderProps) {
  const color = unitColors[unitIndex % unitColors.length];

  return (
    <div
      className={`rounded-2xl p-5 mb-8 shadow-sm ${color.bg} ${color.border} border-b-4 text-white flex items-center justify-between transition-all`}
    >
      <div className="flex-1 pr-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-white/80 mb-1">
          Unit {unit.order}
        </h2>
        <h1 className="text-xl font-black tracking-tight mb-1">
          {unit.title}
        </h1>
        {unit.description && (
          <p className="text-xs font-semibold text-white/90 line-clamp-2">
            {unit.description}
          </p>
        )}
      </div>

      {/* Guidebook Button */}
      <button
        type="button"
        title="View Guidebook"
        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 active:translate-y-0.5 font-extrabold text-xs uppercase tracking-wider backdrop-blur-sm border-2 border-white/30 transition-all shrink-0"
      >
        <BookOpen className="w-4 h-4" />
        <span className="hidden sm:inline">Guidebook</span>
      </button>
    </div>
  );
}
