"use client";

import React from "react";
import { LottieAnimation } from "@/components/ui/LottieAnimation";
import { Mascot } from "./Mascot";

export type CharacterType = "chef" | "kung-fu-bird" | "owl";

interface AnimatedCharacterProps {
  character?: CharacterType;
  size?: number;
  className?: string;
  mood?: "happy" | "excited" | "sad" | "talking" | "celebrating";
}

export function AnimatedCharacter({
  character = "kung-fu-bird",
  size = 130,
  className = "",
  mood = "happy",
}: AnimatedCharacterProps) {
  if (character === "chef") {
    return (
      <LottieAnimation
        src="/animations/chef.json"
        size={size}
        className={className}
      />
    );
  }

  if (character === "kung-fu-bird") {
    return (
      <LottieAnimation
        src="/animations/kung-fu-bird.json"
        size={size}
        className={className}
      />
    );
  }

  // Fallback / default to SVG Duo Owl Mascot
  return <Mascot mood={mood} size={size} className={className} />;
}
