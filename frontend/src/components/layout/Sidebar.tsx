/**
 * Sidebar — left navigation column (desktop), bottom tab bar (mobile).
 *
 * Nav items: LEARN, LEADERBOARD, QUESTS, SHOP, PROFILE, MORE
 * Active item gets a blue-tinted background with a blue left border.
 * Clicking MORE opens the Duolingo flyout menu with Dark Mode toggle, Settings, Guidebook, etc.
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Trophy,
  Zap,
  User,
  MoreHorizontal,
  ShoppingBag,
  Settings,
  Moon,
  Sun,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { resetProgress } from "@/lib/api";

const navItems = [
  { href: "/learn", label: "LEARN", icon: BookOpen },
  { href: "/leaderboard", label: "LEADERBOARD", icon: Trophy },
  { href: "/quests", label: "QUESTS", icon: Zap },
  { href: "/shop", label: "SHOP", icon: ShoppingBag },
  { href: "/profile", label: "PROFILE", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isDark, toggleTheme } = useTheme();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    }
    if (moreOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [moreOpen]);

  const handleReset = async () => {
    if (window.confirm("Are you sure you want to reset your progress and reseed initial data?")) {
      await resetProgress();
      setMoreOpen(false);
      window.location.reload();
    }
  };

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────── */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-56 border-r-2 border-[#e5e5e5] bg-white z-40 pt-6 pb-8">
        {/* Wordmark */}
        <Link
          href="/learn"
          className="px-6 mb-8 text-3xl font-black tracking-tight text-duo-green select-none"
        >
          duolingo
        </Link>

        {/* Nav items */}
        <nav className="flex flex-col gap-1 px-3 flex-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={[
                  "flex items-center gap-4 px-3 py-3 rounded-xl font-extrabold text-sm tracking-wider transition-colors",
                  isActive
                    ? "bg-blue-50 dark:bg-[#1a334b] text-duo-blue border-l-4 border-duo-blue pl-2"
                    : "text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#203642]",
                ].join(" ")}
              >
                <Icon
                  size={22}
                  strokeWidth={2.5}
                  className={isActive ? "text-duo-blue" : "text-[#afafaf] dark:text-white"}
                />
                <span className="dark:text-white">{label}</span>
              </Link>
            );
          })}

          {/* ── MORE Flyout Button & Popup ─────────────────── */}
          <div className="relative" ref={moreRef}>
            <button
              type="button"
              onClick={() => setMoreOpen((prev) => !prev)}
              className={[
                "w-full flex items-center gap-4 px-3 py-3 rounded-xl font-extrabold text-sm tracking-wider transition-colors",
                moreOpen
                  ? "bg-blue-50 dark:bg-[#1a334b] text-duo-blue border-l-4 border-duo-blue pl-2"
                  : "text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#203642]",
              ].join(" ")}
            >
              <MoreHorizontal
                size={22}
                strokeWidth={2.5}
                className={moreOpen ? "text-duo-blue" : "text-[#afafaf] dark:text-white"}
              />
              <span className="dark:text-white">MORE</span>
            </button>

            {/* Floating Popover Menu */}
            {moreOpen && (
              <div className="absolute left-full top-0 ml-3 w-64 rounded-2xl bg-white border-2 border-[#e5e5e5] shadow-xl z-50 p-2 py-3 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-100">
                {/* Guidebook Link */}
                <Link
                  href="/guidebook"
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-duo-text-dark hover:bg-gray-100 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-green-100 text-duo-green flex items-center justify-center shrink-0">
                    <BookOpen size={16} />
                  </div>
                  <span>Guidebook</span>
                </Link>

                {/* Settings Link */}
                <Link
                  href="/settings"
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-duo-text-dark hover:bg-gray-100 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center shrink-0">
                    <Settings size={16} />
                  </div>
                  <span>Settings</span>
                </Link>

                {/* ── Dark Mode Toggle (Replaces HELP) ──────── */}
                <button
                  type="button"
                  onClick={() => toggleTheme()}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-duo-text-dark hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                      {isDark ? <Moon size={16} /> : <Sun size={16} />}
                    </div>
                    <span>Dark Mode</span>
                  </div>

                  {/* Toggle Switch */}
                  <div
                    className={`w-10 h-6 rounded-full p-0.5 transition-colors border-2 ${
                      isDark ? "bg-duo-green border-duo-green-dark" : "bg-gray-200 border-gray-300"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                        isDark ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </div>
                </button>

                <div className="h-px bg-gray-200 my-1" />

                {/* Reset Progress */}
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-red-500 hover:bg-red-50 transition-colors text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-red-100 text-red-500 flex items-center justify-center shrink-0">
                    <RotateCcw size={16} />
                  </div>
                  <span>Reset Progress</span>
                </button>
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* ── Mobile bottom tab bar ──────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-[#e5e5e5] flex">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-extrabold tracking-wider",
                isActive ? "text-duo-blue" : "text-[#afafaf]",
              ].join(" ")}
            >
              <Icon size={20} strokeWidth={2.5} />
              {label}
            </Link>
          );
        })}

        {/* Mobile Dark Mode / More Toggle */}
        <button
          type="button"
          onClick={() => toggleTheme()}
          className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-extrabold tracking-wider text-[#afafaf] hover:text-duo-blue"
        >
          {isDark ? <Moon size={20} className="text-indigo-400" /> : <Sun size={20} />}
          <span>{isDark ? "DARK" : "LIGHT"}</span>
        </button>
      </nav>
    </>
  );
}
