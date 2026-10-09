/**
 * TopBar — sticky header showing:
 *   - Language flag (Spanish flag emoji)
 *   - Streak (flame icon + count) — orange, opens StreakModal on click
 *   - Gems (gem icon + count) — blue
 *   - Hearts (heart icon + count) — red, opens HeartsModal on click
 *
 * Data comes from UserContext so it stays in sync across pages.
 */

"use client";

import React, { useState } from "react";
import { Flame, Heart, Gem } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { StreakModal } from "@/components/layout/StreakModal";
import { HeartsModal } from "@/components/layout/HeartsModal";

function StatChip({
  icon,
  value,
  colorClass,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  value: number | string;
  colorClass: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex items-center gap-1.5 font-extrabold text-sm hover:bg-gray-100 rounded-xl px-2.5 py-1.5 transition-all active:scale-95 cursor-pointer"
    >
      {icon}
      <span className={colorClass}>{value}</span>
    </button>
  );
}

export function TopBar() {
  const { user, loading } = useUser();
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const [isHeartsModalOpen, setIsHeartsModalOpen] = useState(false);

  // Skeleton shimmer when loading
  if (loading) {
    return (
      <header className="sticky top-0 z-30 bg-white border-b-2 border-[#e5e5e5] px-4 h-14 flex items-center justify-between md:justify-end gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-7 w-16 rounded-full bg-gray-200 animate-pulse" />
        ))}
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b-2 border-[#e5e5e5] px-4 h-14 flex items-center justify-between md:justify-end gap-3">
        {/* Flag — Spanish flag emoji */}
        <div className="md:hidden text-2xl">🇪🇸</div>

        {/* Streak Chip */}
        <StatChip
          label={`${user?.streak ?? 0} day streak`}
          icon={<Flame size={20} className="text-orange-400" fill="currentColor" />}
          value={user?.streak ?? 0}
          colorClass="text-orange-400"
          onClick={() => setIsStreakModalOpen(true)}
        />

        {/* Gems Chip */}
        <StatChip
          label={`${user?.gems ?? 0} gems`}
          icon={<Gem size={20} className="text-duo-blue" fill="currentColor" />}
          value={user?.gems ?? 0}
          colorClass="text-duo-blue"
        />

        {/* Hearts Chip */}
        <StatChip
          label={`${user?.hearts ?? 0} hearts`}
          icon={<Heart size={20} className="text-duo-red" fill="currentColor" />}
          value={user?.hearts ?? 0}
          colorClass="text-duo-red"
          onClick={() => setIsHeartsModalOpen(true)}
        />
      </header>

      {/* Streak Modal */}
      <StreakModal
        isOpen={isStreakModalOpen}
        onClose={() => setIsStreakModalOpen(false)}
      />

      {/* Hearts Modal */}
      <HeartsModal
        isOpen={isHeartsModalOpen}
        onClose={() => setIsHeartsModalOpen(false)}
      />
    </>
  );
}
