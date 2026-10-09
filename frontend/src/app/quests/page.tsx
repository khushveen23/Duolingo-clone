"use client";

import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { useUser } from "@/context/UserContext";
import {
  Zap,
  Gift,
  Trophy,
  Sparkles,
  Flame,
  CheckCircle2,
  Clock,
  Award,
  Check,
} from "lucide-react";

export default function QuestsPage() {
  const { user } = useUser();
  const [claimedQuests, setClaimedQuests] = useState<Record<number, boolean>>({});

  const dailyGoalProgress = user?.daily_goal_progress ?? 0;
  const dailyGoalTarget = user?.daily_goal_xp ?? 20;
  const streak = user?.streak ?? 0;

  const quests = [
    {
      id: 1,
      title: `Earn ${dailyGoalTarget} XP today`,
      description: "Hit your daily learning target",
      progress: Math.min(dailyGoalProgress, dailyGoalTarget),
      target: dailyGoalTarget,
      reward: "15 Gems",
      rewardGems: 15,
      icon: Zap,
      color: "yellow" as const,
      completed: dailyGoalProgress >= dailyGoalTarget,
    },
    {
      id: 2,
      title: "Complete 1 lesson",
      description: "Finish any lesson on your path",
      progress: dailyGoalProgress > 0 ? 1 : 0,
      target: 1,
      reward: "10 Gems",
      rewardGems: 10,
      icon: Trophy,
      color: "green" as const,
      completed: dailyGoalProgress > 0,
    },
    {
      id: 3,
      title: "Maintain your streak",
      description: "Keep your flame alive for today",
      progress: streak > 0 ? 1 : 0,
      target: 1,
      reward: "10 Gems",
      rewardGems: 10,
      icon: Flame,
      color: "yellow" as const,
      completed: streak > 0,
    },
    {
      id: 4,
      title: "Complete 3 exercises with 100% accuracy",
      description: "Demonstrate pristine mastery",
      progress: dailyGoalProgress >= 15 ? 3 : dailyGoalProgress > 0 ? 2 : 0,
      target: 3,
      reward: "20 Gems",
      rewardGems: 20,
      icon: Sparkles,
      color: "blue" as const,
      completed: dailyGoalProgress >= 15,
    },
  ];

  const handleClaim = (questId: number) => {
    setClaimedQuests((prev) => ({ ...prev, [questId]: true }));
  };

  const completedCount = quests.filter((q) => q.completed).length;

  return (
    <MainLayout>
      <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-400 flex items-center justify-center text-white shadow-md shadow-amber-400/20">
            <Zap className="w-9 h-9 fill-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-duo-text-dark tracking-tight">
              Daily Quests
            </h1>
            <p className="text-xs font-bold text-gray-500 flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-duo-blue" />
              <span>Resets every day at midnight</span>
            </p>
          </div>
        </div>

        {/* Monthly Challenge Banner */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-duo-blue to-cyan-500 text-white shadow-md space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-300">
                <Award className="w-7 h-7 fill-current" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-white/80">
                  Monthly Challenge
                </div>
                <h2 className="text-lg font-black tracking-tight">
                  October Champion Badge
                </h2>
              </div>
            </div>
            <span className="text-xs font-black bg-white/20 px-2.5 py-1 rounded-full">
              {completedCount} / 10 Quests
            </span>
          </div>

          <div className="space-y-1">
            <ProgressBar
              value={completedCount}
              max={10}
              variant="yellow"
              height="h-3"
            />
            <p className="text-[11px] font-bold text-white/80 text-right">
              Complete {10 - completedCount} more quests to earn the exclusive October badge!
            </p>
          </div>
        </div>

        {/* Daily Quests List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-duo-text-dark">
              Today&apos;s Quests
            </h3>
            <span className="text-xs font-bold text-gray-400">
              {completedCount} of {quests.length} completed
            </span>
          </div>

          {quests.map((quest) => {
            const Icon = quest.icon;
            const isClaimed = claimedQuests[quest.id];

            return (
              <Card
                key={quest.id}
                className={`p-4 transition-all ${
                  quest.completed
                    ? "bg-green-50/40 border-green-200/80"
                    : "bg-white"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      quest.completed
                        ? "bg-duo-green text-white shadow-xs"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {quest.completed ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>

                  {/* Quest info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <h4 className="font-extrabold text-sm text-duo-text-dark truncate">
                        {quest.title}
                      </h4>
                      <span className="text-xs font-black text-duo-blue shrink-0 flex items-center gap-1">
                        <Gift className="w-3.5 h-3.5" />
                        {quest.reward}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 mb-1.5">
                      <span>{quest.description}</span>
                      <span>
                        {quest.progress} / {quest.target}
                      </span>
                    </div>

                    <ProgressBar
                      value={quest.progress}
                      max={quest.target}
                      variant={quest.completed ? "green" : quest.color}
                      height="h-2"
                    />
                  </div>

                  {/* Claim Button if completed */}
                  {quest.completed && (
                    <div className="shrink-0 pl-1">
                      {isClaimed ? (
                        <div className="text-xs font-black text-duo-green flex items-center gap-1 px-2 py-1 bg-green-100 rounded-xl">
                          <Check className="w-3.5 h-3.5" />
                          <span>Claimed</span>
                        </div>
                      ) : (
                        <Button
                          variant="yellow"
                          size="sm"
                          onClick={() => handleClaim(quest.id)}
                          className="animate-pulse shadow-xs"
                        >
                          Claim
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
