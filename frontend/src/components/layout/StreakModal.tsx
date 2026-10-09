"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Flame, Trophy } from "lucide-react";
import { fetchStreak } from "@/lib/api";
import type { StreakData } from "@/types";

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StreakModal({ isOpen, onClose }: StreakModalProps) {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchStreak();
        setStreakData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load streak data");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [isOpen]);

  const currentStreak = streakData?.current_streak ?? 0;
  const longestStreak = streakData?.longest_streak ?? currentStreak;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Streak" maxWidth="max-w-md">
      <div className="space-y-6 pt-2 text-center">
        {/* Flame animation & streak counter */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-t from-orange-500 to-amber-300 flex items-center justify-center shadow-lg shadow-orange-500/20 mb-3 animate-bounce">
            <Flame className="w-14 h-14 text-white fill-white drop-shadow" />
          </div>
          <h2 className="text-3xl font-black text-duo-text-dark tracking-tight">
            {currentStreak} Day Streak!
          </h2>
          <p className="text-xs font-bold text-gray-500 mt-1 max-w-xs">
            {currentStreak > 0
              ? "You're on fire! Complete a lesson every day to build your habit."
              : "Start learning today to kick off your streak!"}
          </p>
        </div>

        {/* 7-Day Activity Calendar */}
        <div className="p-4 bg-gray-50 rounded-2xl border-2 border-gray-100">
          <div className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">
            Last 7 Days Activity
          </div>

          {loading ? (
            <div className="flex justify-between items-center py-2">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="w-9 h-12 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="text-xs font-bold text-red-500 py-2">{error}</div>
          ) : streakData?.days ? (
            <div className="flex justify-between items-center gap-1">
              {streakData.days.map((day, idx) => {
                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                    <span className="text-[11px] font-black text-gray-400 uppercase">
                      {day.day_label.slice(0, 3)}
                    </span>
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        day.is_active
                          ? "bg-orange-500 text-white shadow-md shadow-orange-500/30 scale-105"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {day.is_active ? (
                        <Flame className="w-5 h-5 fill-white text-white" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-gray-300" />
                      )}
                    </div>
                    <span className={`text-[10px] font-extrabold ${day.is_today ? "text-duo-blue" : "text-gray-400"}`}>
                      {day.is_today ? "Today" : " "}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* Longest streak info badge */}
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 flex items-center justify-between text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-400 flex items-center justify-center text-white">
              <Trophy className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="text-xs font-black text-duo-text-dark">
                Longest Streak Record
              </div>
              <div className="text-[11px] font-bold text-amber-700">
                Personal best
              </div>
            </div>
          </div>
          <div className="text-base font-black text-amber-600">
            {longestStreak} {longestStreak === 1 ? "day" : "days"}
          </div>
        </div>

        <div>
          <Button variant="primary" className="w-full" onClick={onClose}>
            Continue
          </Button>
        </div>
      </div>
    </Modal>
  );
}
