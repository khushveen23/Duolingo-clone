"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Heart, Gem, Sparkles, Clock, AlertCircle } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { refillHearts, practiceHearts } from "@/lib/api";

interface HeartsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefill?: (method: "gems" | "practice") => Promise<void>;
  outOfHearts?: boolean;
}

export function HeartsModal({ isOpen, onClose, onRefill, outOfHearts = false }: HeartsModalProps) {
  const { user, refresh } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  const hearts = user?.hearts ?? 5;
  const maxHearts = user?.max_hearts ?? 5;
  const gems = user?.gems ?? 0;
  const REFILL_COST = 350;

  useEffect(() => {
    if (user?.seconds_until_next_heart) {
      setRemainingSeconds(user.seconds_until_next_heart);
    }
  }, [user?.seconds_until_next_heart]);

  // Live countdown timer ticker
  useEffect(() => {
    if (!isOpen || hearts >= maxHearts || remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          refresh();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, hearts, maxHearts, remainingSeconds, refresh]);

  const formatCountdown = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleRefill = async () => {
    setError(null);
    setSuccess(null);
    if (hearts >= maxHearts) {
      setError("Your hearts are already full!");
      return;
    }
    if (gems < REFILL_COST) {
      setError(`You need ${REFILL_COST} gems to refill your hearts. You have ${gems}.`);
      return;
    }

    setLoading(true);
    try {
      if (onRefill) { await onRefill("gems"); }
      const res = onRefill ? null : await refillHearts();
      setSuccess(res?.message || "Hearts refilled to full!");
      await refresh();
      setTimeout(() => {
        setSuccess(null);
      }, 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refill hearts");
    } finally {
      setLoading(false);
    }
  };

  const handlePractice = async () => {
    setError(null);
    setSuccess(null);
    if (hearts >= maxHearts) {
      setError("Your hearts are already full!");
      return;
    }

    setLoading(true);
    try {
      if (onRefill) { await onRefill("practice"); }
      const res = onRefill ? null : await practiceHearts();
      setSuccess(res?.message || "+1 Heart earned!");
      await refresh();
      setTimeout(() => {
        setSuccess(null);
      }, 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to practice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={outOfHearts ? "You're out of hearts" : "Hearts"} maxWidth="max-w-md">
      <div className="space-y-6 pt-2">
        {/* Hearts visual row */}
        <div className="flex justify-center items-center gap-3 py-2">
          {Array.from({ length: maxHearts }).map((_, idx) => {
            const isFilled = idx < hearts;
            return (
              <div
                key={idx}
                className={`transition-transform duration-300 ${
                  isFilled ? "scale-105" : "scale-95 opacity-35"
                }`}
              >
                <Heart
                  className={`w-10 h-10 ${
                    isFilled
                      ? "text-duo-red fill-duo-red drop-shadow-md animate-pulse"
                      : "text-gray-300 fill-gray-200"
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Status text & regen countdown */}
        <div className="text-center space-y-1">
          <p className="text-sm font-extrabold text-duo-text-dark">
            You have <span className="text-duo-red">{hearts}</span> / {maxHearts} hearts
          </p>
          {hearts < maxHearts && remainingSeconds > 0 ? (
            <p className="text-xs font-bold text-gray-500 flex items-center justify-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-duo-blue" />
              <span>Next heart in {formatCountdown(remainingSeconds)}</span>
            </p>
          ) : hearts >= maxHearts ? (
            <p className="text-xs font-bold text-duo-green flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{hearts >= maxHearts ? "Full hearts!" : "Your hearts are completely full!"}</span>
            </p>
          ) : null}
        </div>

        {/* Feedback messages */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs font-bold text-duo-green flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Action Options */}
        <div className="space-y-3">
          {/* Refill option */}
          <div className="p-4 rounded-2xl border-2 border-gray-100 hover:border-duo-blue/30 transition-all flex items-center justify-between gap-3 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-duo-red/10 flex items-center justify-center text-duo-red">
                <Heart className="w-7 h-7 fill-duo-red" />
              </div>
              <div>
                <div className="font-extrabold text-sm text-duo-text-dark">
                  {outOfHearts ? "REFILL WITH GEMS" : "Refill Hearts"}
                </div>
                <div className="text-xs text-gray-400 font-bold flex items-center gap-1">
                  <span>Cost: {REFILL_COST}</span>
                  <Gem className="w-3 h-3 text-duo-blue fill-duo-blue inline" />
                  <span>(You have {gems})</span>
                </div>
                {gems < REFILL_COST && hearts < maxHearts && <p className="mt-1 text-[11px] font-bold text-red-500">You need {REFILL_COST} gems to refill.</p>}
              </div>
            </div>

            <Button
              variant="blue"
              size="sm"
              disabled={loading || hearts >= maxHearts || gems < REFILL_COST}
              onClick={handleRefill}
            >
              {outOfHearts ? "350" : "Refill"}
            </Button>
          </div>

          {/* Practice option */}
          <div className="p-4 rounded-2xl border-2 border-gray-100 hover:border-duo-green/30 transition-all flex items-center justify-between gap-3 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-duo-green/10 flex items-center justify-center text-duo-green">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <div className="font-extrabold text-sm text-duo-text-dark">
                  {outOfHearts ? "PRACTICE TO EARN HEARTS" : "Free Practice"}
                </div>
                <div className="text-xs text-gray-400 font-bold">
                  Earn +1 heart for free
                </div>
              </div>
            </div>

            <Button
              variant="green"
              size="sm"
              disabled={loading || hearts >= maxHearts}
              onClick={handlePractice}
            >
              Practice
            </Button>
          </div>
        </div>

        <div className="pt-2">
          <Button variant="secondary" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
