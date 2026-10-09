"use client";

import { useEffect, useState } from "react";
import { Award, type LucideIcon } from "lucide-react";
import type { LeaderboardEntry } from "@/types";

export function Avatar({ name, className = "" }: { name: string; className?: string }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "?";
  return <span aria-label={`${name} avatar`} className={`inline-flex items-center justify-center rounded-full bg-duo-green font-black text-white ${className}`}>{initials}</span>;
}

export function StatCard({ label, value, icon: Icon, color = "text-duo-blue" }: { label: string; value: string | number; icon: LucideIcon; color?: string }) {
  return <div className="flex items-center gap-3 rounded-2xl border-2 border-gray-100 bg-white p-4"><Icon className={`h-6 w-6 shrink-0 ${color}`} /><div className="min-w-0"><div className="truncate font-black text-duo-text-dark">{value}</div><div className="text-xs font-bold text-gray-400">{label}</div></div></div>;
}

export function AchievementBadge({ title, description, icon = "award", progress, target, unlocked }: { title: string; description: string; icon?: string; progress: number; target: number; unlocked: boolean }) {
  return <article className={`rounded-2xl border-2 p-4 ${unlocked ? "border-amber-200 bg-amber-50" : "border-gray-100 bg-gray-50 grayscale"}`}><div className="mb-2 flex items-center gap-2"><Award aria-hidden className={`h-6 w-6 ${unlocked ? "text-amber-500" : "text-gray-400"}`} /><span className="font-black">{title}</span></div><p className="text-xs text-gray-500">{description}</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200"><div className="h-full rounded-full bg-duo-green" style={{ width: `${Math.min(100, target ? (progress / target) * 100 : 0)}%` }} /></div><p className="mt-1 text-right text-[11px] font-bold text-gray-500">{unlocked ? "Unlocked" : `${progress} / ${target}`}</p><span className="sr-only">Badge type: {icon}</span></article>;
}

export function LeaderboardRow({ entry, children }: { entry: LeaderboardEntry; children?: React.ReactNode }) {
  return <div className={`flex items-center justify-between rounded-xl px-3 py-2 ${entry.is_current_user ? "bg-blue-50 font-black" : ""}`}><div className="flex min-w-0 items-center gap-3"><span className="w-6 text-center font-black">{entry.rank}</span><Avatar name={entry.name} className="h-9 w-9 text-xs" /><span className="truncate">{entry.name}{entry.is_current_user ? " (you)" : ""}</span></div><span className="shrink-0 text-sm font-black">{entry.weekly_xp} XP</span>{children}</div>;
}

export function CountdownTimer({ until }: { until: string | null }) {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    const update = () => setRemaining(until ? Math.max(0, Math.ceil((new Date(until).getTime() - Date.now()) / 1000)) : 0);
    update(); const timer = window.setInterval(update, 1000); return () => window.clearInterval(timer);
  }, [until]);
  return <span>{remaining ? `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}` : "Ready"}</span>;
}

export function PopoverCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div role="dialog" className={`rounded-2xl border-2 border-gray-100 bg-white p-4 shadow-xl ${className}`}>{children}</div>;
}
