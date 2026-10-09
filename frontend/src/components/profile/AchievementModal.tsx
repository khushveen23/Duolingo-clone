"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Award, CheckCircle2, Lock, Calendar, Target } from "lucide-react";
import type { AchievementProgress } from "@/types";

interface AchievementModalProps {
  achievement: AchievementProgress | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AchievementModal({ achievement, isOpen, onClose }: AchievementModalProps) {
  if (!achievement) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Achievement Details" maxWidth="max-w-md">
      <div className="space-y-6 pt-2 text-center">
        {/* Badge Icon */}
        <div className="flex justify-center">
          <div
            className={`w-24 h-24 rounded-3xl flex items-center justify-center shadow-lg transition-transform ${
              achievement.unlocked
                ? "bg-gradient-to-tr from-amber-500 to-yellow-300 text-white shadow-amber-500/20"
                : "bg-gray-100 text-gray-400 border-2 border-dashed border-gray-300"
            }`}
          >
            {achievement.unlocked ? (
              <Award className="w-14 h-14 fill-white text-white drop-shadow" />
            ) : (
              <Lock className="w-10 h-10 text-gray-400" />
            )}
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h2 className="text-2xl font-black text-duo-text-dark tracking-tight">
            {achievement.title}
          </h2>
          <p className="text-sm font-bold text-gray-500 mt-1 max-w-xs mx-auto">
            {achievement.description}
          </p>
        </div>

        {/* Status card */}
        <div className="p-4 bg-gray-50 rounded-2xl border-2 border-gray-100 text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-gray-400 uppercase">
              {achievement.unlocked ? "Status: Unlocked" : "Status: In Progress"}
            </span>
            {achievement.unlocked ? (
              <span className="text-xs font-black text-duo-green flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Completed
              </span>
            ) : (
              <span className="text-xs font-black text-duo-blue">
                {achievement.progress} / {achievement.target_value}
              </span>
            )}
          </div>

          <ProgressBar
            value={achievement.progress}
            max={achievement.target_value}
            variant={achievement.unlocked ? "green" : "blue"}
            height="h-3"
          />

          {achievement.unlocked_at && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 pt-1 border-t border-gray-200">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                Earned on {new Date(achievement.unlocked_at).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        <Button variant="primary" className="w-full" onClick={onClose}>
          Awesome!
        </Button>
      </div>
    </Modal>
  );
}
