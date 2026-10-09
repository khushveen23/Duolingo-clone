"use client";

import React, { useState } from "react";
import type { XPHistoryEntry } from "@/types";
import { Zap, TrendingUp } from "lucide-react";

interface XPBarChartProps {
  history: XPHistoryEntry[];
}

export function XPBarChart({ history }: XPBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!history || history.length === 0) {
    return (
      <div className="p-6 text-center text-xs font-bold text-gray-400 bg-gray-50 rounded-2xl">
        No XP activity recorded yet. Complete a lesson to see your weekly stats!
      </div>
    );
  }

  const maxXP = Math.max(...history.map((h) => h.xp), 40);
  const totalWeeklyXP = history.reduce((acc, h) => acc + h.xp, 0);
  const avgDailyXP = Math.round(totalWeeklyXP / history.length);

  return (
    <div className="p-5 bg-white rounded-3xl border-2 border-gray-100 shadow-xs space-y-4">
      {/* Top summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-500 flex items-center justify-center font-black">
            <Zap className="w-4 h-4 fill-amber-500" />
          </div>
          <div>
            <div className="text-xs font-black text-gray-400 uppercase tracking-wider">
              7-Day XP Trend
            </div>
            <div className="text-base font-black text-duo-text-dark">
              {totalWeeklyXP} XP <span className="text-xs font-bold text-gray-400 font-normal">earned</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-bold text-gray-400 flex items-center gap-1 justify-end">
            <TrendingUp className="w-3.5 h-3.5 text-duo-green" />
            <span>Avg {avgDailyXP} XP/day</span>
          </div>
        </div>
      </div>

      {/* Bars container */}
      <div className="pt-6 pb-2">
        <div className="flex items-end justify-between gap-2 h-36 border-b border-gray-100 px-2">
          {history.map((entry, idx) => {
            const heightPercent = Math.max(Math.round((entry.xp / maxXP) * 100), entry.xp > 0 ? 12 : 4);
            const isHovered = hoveredIndex === idx;
            const hasActivity = entry.xp > 0;

            return (
              <div
                key={entry.date || idx}
                className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Floating tooltip */}
                {isHovered && (
                  <div className="absolute -top-10 bg-gray-900 text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-md pointer-events-none whitespace-nowrap z-10 animate-fade-in">
                    {entry.xp} XP
                    <div className="text-[9px] font-medium text-gray-300">
                      {entry.day_label} ({entry.date})
                    </div>
                  </div>
                )}

                {/* Bar */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full max-w-[28px] rounded-t-xl transition-all duration-300 ${
                    hasActivity
                      ? isHovered
                        ? "bg-amber-400 shadow-md shadow-amber-400/30 scale-105"
                        : "bg-duo-yellow hover:bg-amber-400"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Day labels below bars */}
        <div className="flex justify-between items-center gap-2 px-2 mt-2">
          {history.map((entry, idx) => (
            <div key={idx} className="flex-1 text-center">
              <span
                className={`text-[11px] font-black uppercase ${
                  hoveredIndex === idx ? "text-duo-text-dark font-extrabold" : "text-gray-400"
                }`}
              >
                {entry.day_label.slice(0, 3)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
