"use client";

import React from "react";
import { useUser } from "@/context/UserContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AnimatedCharacter } from "@/components/lesson/AnimatedCharacter";
import { Zap, Trophy, Heart, Sparkles } from "lucide-react";
import Link from "next/link";

export function RightPanel() {
  const { user } = useUser();

  const dailyGoalProgress = user?.daily_goal_progress ?? 0;
  const dailyGoalTarget = user?.daily_goal_xp ?? 50;

  return (
    <aside className="hidden lg:flex flex-col gap-5 w-80 shrink-0 pt-4 pb-12 pr-4">
      {/* Super Duolingo Promo Card with Chef Animation */}
      <Card className="p-4 bg-gradient-to-br from-[#1cb0f6] to-[#58cc02] text-white border-0 shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex-1 z-10">
            <div className="flex items-center gap-1.5 mb-1.5 font-black text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Super Duolingo</span>
            </div>
            <p className="text-xs font-semibold text-white/95 mb-3 leading-snug">
              Unlimited hearts, personalized practice & no ads!
            </p>
          </div>
          <div className="w-20 h-20 shrink-0 flex items-center justify-center -mr-2">
            <AnimatedCharacter character="chef" size={85} />
          </div>
        </div>
        <button className="w-full bg-white text-duo-blue font-extrabold text-xs py-2 rounded-xl uppercase tracking-wider border-b-4 border-blue-100 hover:bg-gray-50 active:translate-y-0.5 active:border-b-0 transition-all z-10 relative">
          Try 2 Weeks Free
        </button>
      </Card>

      {/* Daily Goal Card */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 font-black text-base text-duo-text-dark">
            <Zap className="w-5 h-5 text-duo-yellow fill-duo-yellow" />
            <span>Daily Goal</span>
          </div>
          <Link
            href="/settings"
            className="text-xs font-black text-duo-blue hover:underline uppercase tracking-wider"
          >
            Edit goal
          </Link>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-bold text-duo-text mb-1">
              <span>{user?.daily_goal_reached ? "Goal complete!" : `Earn ${dailyGoalTarget} XP`}</span>
              <span className="text-duo-text-dark font-black">
                {dailyGoalProgress} / {dailyGoalTarget} XP
              </span>
            </div>
            <ProgressBar
              value={dailyGoalProgress}
              max={dailyGoalTarget}
              variant="yellow"
              height="h-3"
            />
          </div>

        </div>
      </Card>

      {/* Leaderboard Snippet Card */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 font-black text-base text-duo-text-dark">
            <Trophy className="w-5 h-5 text-duo-orange fill-duo-orange" />
            <span>Bronze League</span>
          </div>
          <Link
            href="/leaderboard"
            className="text-xs font-black text-duo-blue hover:underline uppercase tracking-wider"
          >
            View
          </Link>
        </div>
        <p className="text-xs text-duo-text font-medium mb-3">
          Top 10 advance to Silver League!
        </p>
        <div className="flex items-center justify-between bg-gray-50 rounded-xl p-2.5 border border-[#e5e5e5]">
          <div className="flex items-center gap-3">
            <span className="font-black text-sm text-duo-blue">#1</span>
            <div className="w-8 h-8 rounded-full bg-duo-green flex items-center justify-center font-bold text-white text-xs">
              {user?.name?.slice(0, 1).toUpperCase() || "U"}
            </div>
            <span className="font-bold text-sm text-duo-text-dark truncate max-w-[100px]">
              {user?.name || "You"}
            </span>
          </div>
          <span className="font-black text-xs text-duo-text-dark">
            {user?.weekly_xp ?? 0} XP
          </span>
        </div>
      </Card>

      {/* Refill Hearts Widget */}
      {user && user.hearts < user.max_hearts && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center gap-2 font-black text-sm text-duo-red mb-1">
            <Heart className="w-5 h-5 fill-duo-red" />
            <span>Need more hearts?</span>
          </div>
          <p className="text-xs text-duo-text mb-3">
            Practice lessons to earn back hearts or refill with gems.
          </p>
          <Link href="/learn">
            <Button variant="secondary" size="sm" fullWidth>
              Practice to Refill
            </Button>
          </Link>
        </Card>
      )}
    </aside>
  );
}
