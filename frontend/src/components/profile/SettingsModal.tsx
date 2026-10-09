"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useUser } from "@/context/UserContext";
import { updateSettings } from "@/lib/api";
import { User, Target, Volume2, VolumeX, Check, AlertCircle } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GOAL_OPTIONS = [
  { xp: 10, label: "Casual", description: "10 XP / day (1 lesson)" },
  { xp: 20, label: "Regular", description: "20 XP / day (2 lessons)" },
  { xp: 30, label: "Serious", description: "30 XP / day (3 lessons)" },
  { xp: 50, label: "Intense", description: "50 XP / day (5 lessons)" },
];

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user, refresh } = useUser();
  const [name, setName] = useState(user?.name ?? "");
  const [selectedGoal, setSelectedGoal] = useState<number>(user?.daily_goal_xp ?? 20);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("duo_sound_enabled") !== "false";
    }
    return true;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Sync state when user prop changes
  const [prevUser, setPrevUser] = useState(user);
  if (user !== prevUser) {
    setPrevUser(user);
    if (user) {
      setName(user.name);
      setSelectedGoal(user.daily_goal_xp);
    }
  }

  const handleSoundToggle = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    if (typeof window !== "undefined") {
      localStorage.setItem("duo_sound_enabled", String(nextVal));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!name.trim()) {
      setError("Please enter a valid display name.");
      return;
    }

    setLoading(true);
    try {
      await updateSettings({
        name: name.trim(),
        daily_goal_xp: selectedGoal,
      });
      await refresh();
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Account Settings" maxWidth="max-w-lg">
      <form onSubmit={handleSave} className="space-y-6 pt-2">
        {/* Name Input */}
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-duo-blue" />
            <span>Display Name</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-duo-blue focus:outline-none font-bold text-duo-text-dark transition-colors"
            placeholder="Enter your name"
          />
        </div>

        {/* Daily XP Goal Selection */}
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-duo-green" />
            <span>Daily XP Goal</span>
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {GOAL_OPTIONS.map((opt) => {
              const isSelected = selectedGoal === opt.xp;
              return (
                <button
                  type="button"
                  key={opt.xp}
                  onClick={() => setSelectedGoal(opt.xp)}
                  className={`p-3 rounded-2xl border-2 text-left transition-all ${
                    isSelected
                      ? "border-duo-green bg-green-50/70 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-duo-text-dark">
                      {opt.label}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-duo-green" />}
                  </div>
                  <div className="text-[11px] font-bold text-gray-400 mt-0.5">
                    {opt.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sound Effects Toggle */}
        <div className="p-4 rounded-2xl border-2 border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-duo-blue/10 flex items-center justify-center text-duo-blue">
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
            </div>
            <div>
              <div className="font-black text-sm text-duo-text-dark">
                Sound Effects
              </div>
              <div className="text-xs font-bold text-gray-400">
                Play audio sounds on answer feedback
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSoundToggle}
            className={`w-12 h-7 rounded-full transition-colors relative p-0.5 ${
              soundEnabled ? "bg-duo-green" : "bg-gray-300"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                soundEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs font-bold text-duo-green flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="green"
            className="flex-1"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
