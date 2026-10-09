"use client";

import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Sparkles, Crown, CheckCircle2, Play, X } from "lucide-react";
import type { SkillNode } from "@/types";
import Link from "next/link";

interface SkillPopoverProps {
  skill: SkillNode;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLDivElement | null>;
}

export function SkillPopover({ skill, onClose }: SkillPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const isCompleted = skill.status === "completed";
  const isLocked = skill.status === "locked";

  // Find the first uncompleted lesson, or the first lesson if all done
  const currentLesson =
    skill.lessons.find((l) => !l.completed) || skill.lessons[0];
  const lessonId = currentLesson?.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        ref={popoverRef}
        className="w-full max-w-xs bg-white rounded-3xl p-5 shadow-2xl border-2 border-[#e5e5e5] relative animate-in zoom-in-95 duration-150"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Skill Header */}
        <div className="text-center pt-2 pb-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-duo-green/10 text-duo-green mb-3">
            {isCompleted ? (
              <Crown className="w-8 h-8 text-duo-yellow fill-duo-yellow" />
            ) : (
              <Sparkles className="w-8 h-8 text-duo-green fill-duo-green" />
            )}
          </div>
          <h3 className="text-xl font-black text-duo-text-dark tracking-tight">
            {skill.title}
          </h3>
          <p className="text-xs font-bold text-gray-500 mt-1">
            {isCompleted
              ? "Skill Mastered! Review anytime."
              : isLocked
              ? "Complete previous skills to unlock"
              : `Lesson ${skill.completed_lessons + 1} of ${skill.total_lessons}`}
          </p>
        </div>

        {/* Lesson Progress Status */}
        <div className="bg-gray-50 rounded-2xl p-3 mb-5 border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-duo-yellow fill-duo-yellow" />
            <span className="text-xs font-extrabold text-duo-text-dark">
              Crown Level
            </span>
          </div>
          <span className="text-xs font-black text-duo-yellow-dark">
            {skill.levels_completed} / {skill.total_levels}
          </span>
        </div>

        {/* Action Button */}
        {isLocked ? (
          <Button variant="locked" fullWidth disabled>
            Locked
          </Button>
        ) : lessonId ? (
          <Link href={`/lesson/${lessonId}`} className="block w-full">
            <Button
              variant={isCompleted ? "blue" : "primary"}
              fullWidth
              size="md"
              className="flex items-center justify-center gap-2"
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Practice +5 XP</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>Start +10 XP</span>
                </>
              )}
            </Button>
          </Link>
        ) : (
          <Button variant="locked" fullWidth disabled>
            No Lessons Available
          </Button>
        )}
      </div>
    </div>
  );
}
