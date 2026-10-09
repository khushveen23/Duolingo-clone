"use client";

import React, { useEffect, useRef } from "react";
import lottie, { type AnimationItem } from "lottie-web";

interface LottieAnimationProps {
  src?: string; // e.g. "/animations/chef.json"
  animationData?: object;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  size?: number | string;
}

export function LottieAnimation({
  src,
  animationData,
  loop = true,
  autoplay = true,
  className = "",
  size,
}: LottieAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<AnimationItem | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Destroy existing instance if any
    if (animRef.current) {
      animRef.current.destroy();
    }

    try {
      if (src) {
        animRef.current = lottie.loadAnimation({
          container: containerRef.current,
          renderer: "svg",
          loop,
          autoplay,
          path: src,
        });
      } else if (animationData) {
        animRef.current = lottie.loadAnimation({
          container: containerRef.current,
          renderer: "svg",
          loop,
          autoplay,
          animationData,
        });
      }
    } catch (err) {
      console.error("Failed to load Lottie animation:", err);
    }

    return () => {
      if (animRef.current) {
        animRef.current.destroy();
        animRef.current = null;
      }
    };
  }, [src, animationData, loop, autoplay]);

  return (
    <div
      ref={containerRef}
      className={`select-none inline-flex items-center justify-center ${className}`}
      style={
        size
          ? { width: size, height: size }
          : { width: "100%", height: "100%" }
      }
    />
  );
}
