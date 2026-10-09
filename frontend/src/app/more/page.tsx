"use client";

import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useUser } from "@/context/UserContext";
import { refillHearts, practiceHearts } from "@/lib/api";
import { Heart, Sparkles, Gem, Check, AlertCircle, Settings } from "lucide-react";
import Link from "next/link";

export default function MorePage() {
  const { user, refresh } = useUser();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hearts = user?.hearts ?? 5;
  const maxHearts = user?.max_hearts ?? 5;
  const gems = user?.gems ?? 0;
  const REFILL_COST = 350;

  const handleRefillHearts = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await refillHearts();
      await refresh();
      setMessage(res.message || "Hearts refilled to full!");
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refill failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePractice = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await practiceHearts();
      await refresh();
      setMessage(res.message || "+1 Heart earned!");
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Practice failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-black text-duo-text-dark tracking-tight">
            Shop & Powers
          </h1>
          <p className="text-xs font-bold text-gray-500 mt-1">
            Spend your gems to power up your learning and protect your streak.
          </p>
        </div>

        {message && (
          <div className="p-3 bg-green-50 border border-green-200 text-duo-green-dark text-xs font-bold rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Refill Hearts */}
          <Card className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center text-duo-red shrink-0">
                <Heart className="w-8 h-8 fill-duo-red" />
              </div>
              <div>
                <h3 className="font-black text-base text-duo-text-dark">
                  Refill Hearts
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  Get full hearts so you can worry less about mistakes.
                </p>
                <div className="flex items-center gap-2 text-xs font-black text-duo-red mt-1">
                  <span>Current: {hearts} / {maxHearts}</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-duo-blue flex items-center gap-0.5">
                    <Gem className="w-3.5 h-3.5 fill-duo-blue" />
                    {REFILL_COST} Gems
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="blue"
              size="sm"
              disabled={loading || hearts >= maxHearts || gems < REFILL_COST}
              onClick={handleRefillHearts}
              className="shrink-0"
            >
              {loading ? "..." : hearts >= maxHearts ? "Full" : "Refill"}
            </Button>
          </Card>

          {/* Free Practice */}
          <Card className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center text-duo-green shrink-0">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-black text-base text-duo-text-dark">
                  Practice to Earn Hearts
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  Review previously learned material and earn +1 heart for free.
                </p>
                <div className="text-xs font-black text-duo-green mt-1">
                  Free
                </div>
              </div>
            </div>

            <Button
              variant="green"
              size="sm"
              disabled={loading || hearts >= maxHearts}
              onClick={handlePractice}
              className="shrink-0"
            >
              {loading ? "..." : "Practice"}
            </Button>
          </Card>

          {/* Gem packs placeholder */}
          <Card className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-duo-blue shrink-0">
                <Gem className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-black text-base text-duo-text-dark">
                  Gem Packs
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  More gems for your learning journey.
                </p>
                <div className="flex items-center gap-1 text-xs font-black text-duo-blue mt-1">
                  <Gem className="w-3.5 h-3.5 fill-duo-blue" />
                  <span>Coming Soon</span>
                </div>
              </div>
            </div>

            <Button variant="secondary" size="sm" className="shrink-0" disabled>
              Soon
            </Button>
          </Card>

          {/* Super Duolingo */}
          <Card className="p-5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-yellow-300 shrink-0">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-black text-base text-white">
                  Super Duolingo
                </h3>
                <p className="text-xs text-white/90 font-medium mb-3">
                  Enjoy unlimited hearts, progress tracking, and zero interruptions.
                </p>
                <button disabled className="bg-white/80 text-blue-600 font-black text-xs px-4 py-2.5 rounded-xl uppercase tracking-wider">
                  Coming Soon
                </button>
              </div>
            </div>
          </Card>
        </div>
        <Link href="/settings" className="flex items-center gap-2 rounded-2xl border-2 border-gray-100 p-4 font-black text-duo-blue"><Settings className="h-5 w-5"/>Settings</Link>
      </div>
    </MainLayout>
  );
}
