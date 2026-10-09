"use client";

import React, { useEffect, useRef, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { fetchLeaderboard } from "@/lib/api";
import type { LeaderboardData } from "@/types";
import { Trophy, Shield, Flame, Sparkles, Clock, ArrowUpCircle, Check } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUserRow = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchLeaderboard();
        setData(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (data?.leaderboard.some((entry) => entry.is_current_user)) {
      currentUserRow.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [data]);

  const leagueName = data?.league_name ?? "Bronze";
  const daysLeft = data?.days_left ?? 3;

  return (
    <MainLayout>
      <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-6">
        {/* League Header Banner */}
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20 border-4 border-white mb-3 animate-pulse">
            <Trophy className="w-12 h-12 text-white fill-white drop-shadow" />
          </div>
          <h1 className="text-3xl font-black text-duo-text-dark tracking-tight">
            {leagueName} League
          </h1>
          <p className="text-xs font-bold text-gray-500 mt-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-duo-blue" />
            <span>
              {daysLeft} {daysLeft === 1 ? "day" : "days"} left in the week
            </span>
          </p>
        </div>

        {/* Promotion Zone Info Card */}
        <div className="p-3.5 bg-green-50 rounded-2xl border-2 border-green-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-duo-green flex items-center justify-center text-white">
              <ArrowUpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-duo-green">
                Promotion Zone
              </div>
              <div className="text-[11px] font-bold text-gray-500">
                Top 10 players advance to Silver League!
              </div>
            </div>
          </div>
          <div className="text-xs font-black text-duo-green bg-white px-2.5 py-1 rounded-full border border-green-200 shadow-2xs">
            Ranks 1–10
          </div>
        </div>

        {/* Leaderboard Table */}
        <Card className="overflow-hidden p-0">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="h-14 rounded-2xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center text-sm text-red-500">{error}</div>
          ) : data?.leaderboard ? (
            <div className="divide-y divide-gray-100">
              {data.leaderboard.map((entry) => {
                const isFirst = entry.rank === 1;
                const isSecond = entry.rank === 2;
                const isThird = entry.rank === 3;
                const isPromoted = entry.rank <= 10;

                return (
                  <div
                    key={entry.user_id}
                    ref={entry.is_current_user ? currentUserRow : undefined}
                    className={[
                      "flex items-center justify-between p-4 transition-colors",
                      entry.is_current_user
                        ? "bg-blue-50/90 font-black border-l-4 border-duo-blue shadow-inner"
                        : "hover:bg-gray-50",
                    ].join(" ")}
                  >
                    {/* Rank + Avatar + User Info */}
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Rank badge */}
                      <div className="w-7 text-center shrink-0">
                        {isFirst ? (
                          <div className="w-7 h-7 rounded-full bg-amber-400 text-white font-black text-xs flex items-center justify-center shadow-xs">
                            1
                          </div>
                        ) : isSecond ? (
                          <div className="w-7 h-7 rounded-full bg-slate-300 text-white font-black text-xs flex items-center justify-center shadow-xs">
                            2
                          </div>
                        ) : isThird ? (
                          <div className="w-7 h-7 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center shadow-xs">
                            3
                          </div>
                        ) : (
                          <span
                            className={`font-black text-sm ${
                              isPromoted ? "text-duo-green" : "text-gray-400"
                            }`}
                          >
                            {entry.rank}
                          </span>
                        )}
                      </div>

                      {/* Avatar */}
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-black text-base shadow-xs shrink-0 ${
                          isFirst
                            ? "bg-amber-400 ring-2 ring-amber-300"
                            : isSecond
                            ? "bg-slate-400 ring-2 ring-slate-200"
                            : isThird
                            ? "bg-amber-700 ring-2 ring-amber-600/30"
                            : entry.is_current_user
                            ? "bg-duo-blue ring-2 ring-blue-300"
                            : "bg-duo-green"
                        }`}
                      >
                        {entry.name.slice(0, 1).toUpperCase()}
                      </div>

                      {/* Name & Streak */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-extrabold text-sm text-duo-text-dark truncate">
                            {entry.name}
                          </span>
                          {entry.is_current_user && (
                            <span className="text-[10px] bg-duo-blue text-white px-2 py-0.5 rounded-full uppercase font-black tracking-wider shrink-0">
                              You
                            </span>
                          )}
                        </div>
                        {entry.streak > 0 && (
                          <div className="flex items-center gap-1 text-[11px] font-bold text-orange-400">
                            <Flame className="w-3 h-3 fill-orange-400 shrink-0" />
                            <span>{entry.streak} day streak</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* XP display */}
                    <div className="text-right shrink-0 pl-3">
                      <span className="font-black text-sm text-duo-text-dark">
                        {entry.weekly_xp} XP
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </Card>
      </div>
    </MainLayout>
  );
}
