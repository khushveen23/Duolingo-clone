"use client";

import { HeartsModal } from "@/components/layout/HeartsModal";

/** Lesson player adapter that reuses the top bar heart refill UI. */
export function OutOfHeartsModal({ onRefill }: { onRefill: (method: "gems" | "practice") => Promise<void> }) {
  return <HeartsModal isOpen onClose={() => undefined} onRefill={onRefill} outOfHearts />;
}
