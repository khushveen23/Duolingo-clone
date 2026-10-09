/**
 * Sidebar — left navigation column (desktop), bottom tab bar (mobile).
 *
 * Nav items: LEARN, LEADERBOARD, QUESTS, PROFILE, MORE
 * Active item gets a blue-tinted background with a blue left border.
 * The "duolingo" wordmark appears at the top in the brand green.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Trophy,
  Zap,
  User,
  MoreHorizontal,
  ShoppingBag,
} from "lucide-react";

const navItems = [
  { href: "/learn", label: "LEARN", icon: BookOpen },
  { href: "/leaderboard", label: "LEADERBOARD", icon: Trophy },
  { href: "/quests", label: "QUESTS", icon: Zap },
  { href: "/shop", label: "SHOP", icon: ShoppingBag },
  { href: "/profile", label: "PROFILE", icon: User },
  { href: "/more", label: "MORE", icon: MoreHorizontal },
];

export function Sidebar() {
  const pathname = usePathname();

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
        <nav className="flex flex-col gap-1 px-3">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={[
                  "flex items-center gap-4 px-3 py-3 rounded-xl font-extrabold text-sm tracking-wider transition-colors",
                  isActive
                    ? "bg-blue-50 text-duo-blue border-l-4 border-duo-blue pl-2"
                    : "text-[#4b4b4b] hover:bg-gray-100",
                ].join(" ")}
              >
                <Icon
                  size={22}
                  strokeWidth={2.5}
                  className={isActive ? "text-duo-blue" : "text-[#afafaf]"}
                />
                {label}
              </Link>
            );
          })}
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
      </nav>
    </>
  );
}
