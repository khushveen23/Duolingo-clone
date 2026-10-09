"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatedCharacter } from "./AnimatedCharacter";
import { Button } from "@/components/ui/Button";
import type { LessonCompleteResponse } from "@/types";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { Zap, Target, Flame, Trophy, Check, Award, Sparkles } from "lucide-react";

interface LessonCompleteScreenProps {
  completion: LessonCompleteResponse;
  totalExercises: number;
  mistakesCount: number;
}

export function LessonCompleteScreen({
  completion,
  totalExercises,
  mistakesCount,
}: LessonCompleteScreenProps) {
  const router = useRouter();
  const { refresh } = useUser();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stage, setStage] = useState<"summary" | "streak">("summary");

  const newlyUnlocked = completion.newly_unlocked_achievements || [];

  // Calculate Accuracy Percentage
  const accuracy =
    totalExercises > 0
      ? Math.max(0, Math.round((totalExercises / (totalExercises + mistakesCount)) * 100))
      : 100;

  // Lightweight Confetti Particle Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#58cc02", "#1cb0f6", "#ffc800", "#ff4b4b", "#ce82ff"];
    const particles = Array.from({ length: 90 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      size: Math.random() * 8 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: Math.random() * 4 + 2,
      speedX: (Math.random() - 0.5) * 3,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 6,
    }));

    let animationId: number;

    function render() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;

        if (p.y > canvas.height) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });

      animationId = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  const handleFinish = async () => {
    await refresh();
    router.push("/learn");
  };

  const daysOfWeek = ["M", "T", "W", "T", "F", "S", "S"];
  const currentDayIndex = (new Date().getDay() + 6) % 7; // Monday = 0

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col justify-between overflow-y-auto select-none">
      {/* Confetti Background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-10"
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full px-6 py-10 z-20 animate-in fade-in zoom-in-95 duration-300">
        {stage === "summary" ? (
          <>
            {/* Celebratory Animated Character */}
            <div className="w-44 h-44 mb-2 flex items-center justify-center">
              <AnimatedCharacter character="kung-fu-bird" size={170} />
            </div>

            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl font-black text-duo-yellow-dark tracking-tight text-center mb-1">
              Lesson Complete!
            </h1>
            <p className="text-sm font-bold text-gray-500 mb-6">
              {completion.is_perfect
                ? "Perfect lesson! Bonus XP awarded!"
                : "You crushed it! Keep up the great work."}
            </p>

            {/* 3 Stat Cards */}
            <div className="grid grid-cols-3 gap-3 w-full mb-5">
              {/* TOTAL XP */}
              <div className="bg-amber-400 text-white rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-md border-b-4 border-amber-600">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-900/80 mb-1">
                  TOTAL XP
                </span>
                <div className="flex items-center gap-1">
                  <Zap className="w-5 h-5 fill-white" />
                  <span className="text-2xl font-black">{completion.xp_earned}</span>
                </div>
              </div>

              {/* ACCURACY */}
              <div className="bg-duo-green text-white rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-md border-b-4 border-duo-green-dark">
                <span className="text-[11px] font-black uppercase tracking-wider text-green-900/80 mb-1">
                  ACCURACY
                </span>
                <div className="flex items-center gap-1">
                  <Target className="w-5 h-5" />
                  <span className="text-2xl font-black">{accuracy}%</span>
                </div>
              </div>

              {/* STREAK */}
              <div className="bg-duo-blue text-white rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-md border-b-4 border-duo-blue-dark">
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-900/80 mb-1">
                  STREAK
                </span>
                <div className="flex items-center gap-1">
                  <Flame className="w-5 h-5 fill-white text-white" />
                  <span className="text-2xl font-black">{completion.streak}</span>
                </div>
              </div>
            </div>

            {/* Unlocked Achievements Banner */}
            {newlyUnlocked.length > 0 && (
              <div className="w-full space-y-2 mb-4">
                {newlyUnlocked.map((ach) => (
                  <div
                    key={ach.id}
                    className="w-full bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 rounded-2xl p-3.5 flex items-center gap-3 shadow-md animate-bounce"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/40 backdrop-blur flex items-center justify-center shrink-0">
                      <Award className="w-6 h-6 text-amber-900 fill-amber-900" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <div className="text-[10px] font-black uppercase tracking-wider text-amber-900/80 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Achievement Unlocked!</span>
                      </div>
                      <div className="text-sm font-black truncate">{ach.title}</div>
                      <div className="text-xs font-bold text-amber-900/90 truncate">
                        {ach.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Daily Goal Achieved Banner */}
            {completion.daily_goal_reached && (
              <div className="w-full bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-4 flex items-center gap-3 text-left mb-4 animate-in slide-in-from-bottom-2">
                <div className="w-10 h-10 rounded-xl bg-duo-yellow flex items-center justify-center text-white shrink-0">
                  <Trophy className="w-6 h-6 fill-white" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-yellow-900">
                    Daily Goal Reached!
                  </h4>
                  <p className="text-xs font-bold text-yellow-700">
                    {completion.daily_goal_progress} / {completion.daily_goal_target} XP earned today
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Streak Extended Stage */
          <>
            <div className="relative mb-6">
              <div className="w-28 h-28 rounded-full bg-orange-100 flex items-center justify-center animate-pulse">
                <Flame className="w-20 h-20 fill-orange-500 text-orange-500" />
              </div>
            </div>

            <h2 className="text-3xl font-black text-orange-500 tracking-tight text-center mb-1">
              {completion.streak} Day Streak!
            </h2>
            <p className="text-sm font-bold text-gray-500 mb-8 text-center">
              Practice every day to keep your streak burning hot!
            </p>

            {/* Weekly Days Row */}
            <div className="flex items-center justify-between w-full max-w-xs bg-gray-50 p-4 rounded-2xl border border-gray-200 mb-8">
              {daysOfWeek.map((day, idx) => {
                const isToday = idx === currentDayIndex;
                const isPast = idx <= currentDayIndex;
                return (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <span className="text-xs font-black text-gray-400">{day}</span>
                    <div
                      className={[
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all",
                        isPast
                          ? "bg-orange-500 text-white shadow-xs"
                          : "bg-gray-200 text-gray-400",
                      ].join(" ")}
                    >
                      {isPast ? <Check className="w-4 h-4 stroke-[3]" /> : ""}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Bottom Action Footer */}
      <footer className="w-full bg-white border-t-2 border-[#e5e5e5] p-5 z-20">
        <div className="max-w-md mx-auto">
          {stage === "summary" && completion.streak > 0 ? (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => setStage("streak")}
            >
              Continue
            </Button>
          ) : (
            <Button variant="primary" size="lg" fullWidth onClick={handleFinish}>
              Return to Learning Path
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
