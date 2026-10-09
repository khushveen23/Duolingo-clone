"use client";

import React, { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { fetchProfile } from "@/lib/api";
import type { ProfileData, AchievementProgress } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { XPBarChart } from "@/components/profile/XPBarChart";
import { AchievementModal } from "@/components/profile/AchievementModal";
import { SettingsModal } from "@/components/profile/SettingsModal";
import { Avatar } from "@/components/gamification";
import {
  Flame,
  Zap,
  Award,
  Gem,
  Calendar,
  Settings,
  BookOpen,
  CheckCircle2,
  Lock,
  Trophy,
} from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementProgress | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchProfile();
        setProfile(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="w-full max-w-2xl mx-auto px-4 py-8 space-y-6">
          <div className="h-32 rounded-3xl bg-gray-100 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
          <div className="h-44 rounded-3xl bg-gray-100 animate-pulse" />
        </div>
      </MainLayout>
    );
  }

  if (error || !profile) {
    return (
      <MainLayout>
        <div className="p-12 text-center text-sm text-red-500">
          {error || "Could not load profile"}
        </div>
      </MainLayout>
    );
  }

  const stats = [
    {
      label: "Day streak",
      value: `${profile.streak} ${profile.streak === 1 ? "day" : "days"}`,
      icon: Flame,
      color: "text-orange-400 fill-orange-400",
      bgColor: "bg-orange-50",
    },
    {
      label: "Longest streak",
      value: `${profile.longest_streak ?? profile.streak} ${
        (profile.longest_streak ?? profile.streak) === 1 ? "day" : "days"
      }`,
      icon: Trophy,
      color: "text-amber-500 fill-amber-500",
      bgColor: "bg-amber-50",
    },
    {
      label: "Total XP",
      value: `${profile.total_xp} XP`,
      icon: Zap,
      color: "text-duo-yellow fill-duo-yellow",
      bgColor: "bg-yellow-50",
    },
    {
      label: "Current league",
      value: "Bronze",
      icon: Award,
      color: "text-amber-700 fill-amber-700",
      bgColor: "bg-amber-100/50",
    },
    {
      label: "Gems",
      value: profile.gems,
      icon: Gem,
      color: "text-duo-blue fill-duo-blue",
      bgColor: "bg-blue-50",
    },
    {
      label: "Lessons done",
      value: profile.completed_lessons_count,
      icon: BookOpen,
      color: "text-duo-green",
      bgColor: "bg-green-50",
    },
  ];

  const categories = [
    { id: "all", label: "All" },
    { id: "streak", label: "Streak" },
    { id: "xp", label: "XP" },
    { id: "lessons", label: "Lessons" },
    { id: "perfect", label: "Mastery" },
  ];

  const filteredAchievements = (profile.achievements || []).filter((ach) => {
    if (activeCategory === "all") return true;
    if (activeCategory === "lessons") return ach.category === "lessons" || ach.category === "skills";
    if (activeCategory === "perfect") return ach.category === "perfect";
    return ach.category === activeCategory;
  });

  const unlockedCount = profile.achievements.filter((a) => a.unlocked).length;

  return (
    <MainLayout>
      <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* User Header */}
        <div className="flex items-center justify-between pb-6 border-b-2 border-gray-100">
          <div className="flex items-center gap-5">
            <Avatar name={profile.name} className="h-20 w-20 border-4 border-white text-3xl shadow-md sm:h-24 sm:w-24 sm:text-4xl" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-duo-text-dark tracking-tight">
                {profile.name}
              </h1>
              <p className="text-xs font-bold text-gray-400 flex items-center gap-1.5 mt-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Joined {new Date(profile.joined_date).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</span>
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
        </div>

        {/* Statistics Grid */}
        <section>
          <h2 className="text-lg font-black text-duo-text-dark mb-4">
            Statistics
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[stats[0], stats[2], stats[3], stats[1]].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <Card key={i} className="p-4 flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-base font-black text-duo-text-dark truncate">
                      {stat.value}
                    </div>
                    <div className="text-[11px] font-bold text-gray-400 truncate">
                      {stat.label}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-black text-duo-text-dark">Friends</h2>
          <Card className="p-6 text-center"><p className="font-black text-gray-500">Coming Soon</p><p className="mt-1 text-sm text-gray-400">Your friends and social learning space will appear here.</p></Card>
        </section>

        {/* 7-Day XP Activity Chart */}
        <section>
          <XPBarChart history={profile.xp_history || []} />
        </section>

        {/* Courses Section */}
        <section>
          <h2 className="text-lg font-black text-duo-text-dark mb-3">
            Courses
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {(profile.courses && profile.courses.length > 0
              ? profile.courses
              : [{ id: 1, language: "es", title: "Spanish (Introductory)" }]
            ).map((course) => (
              <Card key={course.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="text-3xl">🇪🇸</div>
                  <div>
                    <h3 className="font-extrabold text-sm text-duo-text-dark">
                      {course.title}
                    </h3>
                    <p className="text-xs font-bold text-gray-400">
                      {profile.completed_skills_count} skills completed
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-duo-green bg-green-50 px-2.5 py-1 rounded-full">
                    Active
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Achievements Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-black text-duo-text-dark">
                Achievements
              </h2>
              <p className="text-xs font-bold text-gray-400">
                {unlockedCount} of {profile.achievements.length} unlocked
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1 rounded-full text-xs font-black transition-all ${
                    activeCategory === cat.id
                      ? "bg-duo-green text-white shadow-xs"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredAchievements.map((ach) => (
              <Card
                key={ach.id}
                onClick={() => setSelectedAchievement(ach)}
                className={`p-4 flex items-center gap-4 transition-all cursor-pointer hover:shadow-md ${
                  ach.unlocked
                    ? "bg-amber-50/40 border-amber-200/70"
                    : "bg-white hover:border-gray-300"
                }`}
              >
                {/* Badge Icon */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform ${
                    ach.unlocked
                      ? "bg-gradient-to-tr from-amber-500 to-yellow-400 text-white shadow-md shadow-amber-500/20"
                      : "bg-gray-100 text-gray-400 border border-dashed border-gray-300"
                  }`}
                >
                  {ach.unlocked ? (
                    <Award className="w-8 h-8 fill-current drop-shadow-xs" />
                  ) : (
                    <Lock className="w-6 h-6 text-gray-400" />
                  )}
                </div>

                {/* Info & Progress */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-black text-sm text-duo-text-dark flex items-center gap-1.5">
                      {ach.title}
                      {ach.unlocked && (
                        <CheckCircle2 className="w-4 h-4 text-duo-green shrink-0" />
                      )}
                    </h3>
                    <span className="text-xs font-black text-gray-400 shrink-0">
                      {ach.unlocked
                        ? "Completed"
                        : `${ach.progress}/${ach.target_value}`}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 font-medium mb-2 line-clamp-1">
                    {ach.description}
                  </p>

                  <ProgressBar
                    value={ach.progress}
                    max={ach.target_value}
                    variant={ach.unlocked ? "yellow" : "blue"}
                    height="h-2"
                  />
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>

      {/* Achievement Detail Modal */}
      <AchievementModal
        achievement={selectedAchievement}
        isOpen={!!selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </MainLayout>
  );
}
