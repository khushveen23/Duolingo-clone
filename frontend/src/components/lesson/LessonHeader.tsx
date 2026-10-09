"use client";

import React, { useState } from "react";
import { X, Heart, Volume2, VolumeX } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { sounds } from "@/lib/sound";

interface LessonHeaderProps {
  completedCount: number;
  totalExercises: number;
  hearts: number;
  shakeHeart?: boolean;
}

export function LessonHeader({
  completedCount,
  totalExercises,
  hearts,
  shakeHeart = false,
}: LessonHeaderProps) {
  const router = useRouter();
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [isMuted, setIsMuted] = useState(sounds.muted);

  const toggleSound = () => {
    const nextMuted = sounds.toggleMute();
    setIsMuted(nextMuted);
  };

  const progressPercent =
    totalExercises > 0
      ? Math.min(100, Math.max(0, (completedCount / totalExercises) * 100))
      : 0;

  return (
    <>
      <header className="w-full max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-4 select-none">
        {/* Quit (X) Button */}
        <button
          type="button"
          onClick={() => setShowQuitModal(true)}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
          aria-label="Quit lesson"
        >
          <X className="w-6 h-6 stroke-[3]" />
        </button>

        {/* Progress Bar with Shiny Top Highlight */}
        <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden relative shadow-inner">
          <div
            className="h-full bg-duo-green rounded-full transition-all duration-500 ease-out relative"
            style={{ width: `${progressPercent}%` }}
          >
            {/* Glossy top stripe highlight */}
            <div className="absolute top-1 left-2 right-2 h-1 bg-white/40 rounded-full" />
          </div>
        </div>

        {/* Right Controls: Sound Toggle + Hearts */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSound}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-gray-400" />
            ) : (
              <Volume2 className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {/* Hearts Display with Shake Effect */}
          <div
            className={`flex items-center gap-1.5 font-black text-duo-red transition-transform ${
              shakeHeart ? "animate-bounce scale-110" : ""
            }`}
          >
            <Heart className="w-6 h-6 fill-duo-red text-duo-red" />
            <span className="text-base">{hearts}</span>
          </div>
        </div>
      </header>

      {/* Quit Confirmation Modal */}
      {showQuitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border-2 border-[#e5e5e5] text-center animate-in zoom-in-95 duration-150">
            <h3 className="text-xl font-black text-duo-text-dark tracking-tight mb-2">
              Wait, don&apos;t go!
            </h3>
            <p className="text-sm font-semibold text-gray-500 mb-6">
              You&apos;ll lose your progress and streak credit for this lesson if you exit now.
            </p>

            <div className="flex flex-col gap-3">
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={() => setShowQuitModal(false)}
              >
                Keep Learning
              </Button>

              <button
                type="button"
                onClick={() => router.push("/learn")}
                className="py-2.5 text-xs font-black uppercase tracking-wider text-duo-red hover:underline transition-all"
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
