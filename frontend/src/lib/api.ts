/**
 * Typed API client — one function per backend endpoint.
 * The base URL is read from the NEXT_PUBLIC_API_URL env variable so it's
 * never hardcoded and can be changed per deployment environment.
 */

import type {
  UserStats,
  UpdateSettingsPayload,
  PathData,
  LeaderboardData,
  ProfileData,
  StreakData,
  HeartRefillResponse,
  HeartPracticeResponse,
  LessonDetail,
  AnswerResponse,
  LessonCompleteResponse,
} from "@/types";

// Read the base URL once at module load — fails loudly if missing.
const BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

// Generic fetch wrapper that throws a descriptive error on non-2xx responses.
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    let errorDetail = `API ${res.status} on ${path}`;
    try {
      const errData = await res.json();
      if (errData.detail) {
        errorDetail = errData.detail;
      }
    } catch {
      const body = await res.text().catch(() => "");
      if (body) errorDetail = body;
    }
    throw new Error(errorDetail);
  }
  return res.json() as Promise<T>;
}

// ── Endpoints ─────────────────────────────────────────────

/** GET /api/me — Current user stats (XP, streak, hearts, gems, daily goal) */
export const fetchMe = () => apiFetch<UserStats>("/api/me");

/** PATCH /api/me/settings — Update user preferences (daily goal XP, display name) */
export const updateSettings = (payload: UpdateSettingsPayload) =>
  apiFetch<UserStats>("/api/me/settings", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

/** GET /api/path — Full learning tree with skill statuses */
export const fetchPath = () => apiFetch<PathData>("/api/path");

/** GET /api/leaderboard — Weekly ranking table with league info */
export const fetchLeaderboard = () => apiFetch<LeaderboardData>("/api/leaderboard");

/** GET /api/profile — Profile with achievements and 7-day XP history */
export const fetchProfile = () => apiFetch<ProfileData>("/api/profile");

/** GET /api/streak — Current streak + 7-day activity history */
export const fetchStreak = () => apiFetch<StreakData>("/api/streak");

/** POST /api/hearts/refill — Refill hearts for 350 gems */
export const refillHearts = () =>
  apiFetch<HeartRefillResponse>("/api/hearts/refill", { method: "POST" });

/** POST /api/hearts/practice — Practice to earn +1 heart free */
export const practiceHearts = () =>
  apiFetch<HeartPracticeResponse>("/api/hearts/practice", { method: "POST" });

/** GET /api/lessons/:id — Lesson exercises (sanitized, no answers) */
export const fetchLesson = (id: number) => apiFetch<LessonDetail>(`/api/lessons/${id}`);

/** POST /api/lessons/:id/answer — Submit one exercise answer */
export const submitAnswer = (lessonId: number, exerciseId: number, answer: unknown) =>
  apiFetch<AnswerResponse>(`/api/lessons/${lessonId}/answer`, {
    method: "POST",
    body: JSON.stringify({ exercise_id: exerciseId, answer }),
  });

/** POST /api/lessons/:id/complete — Complete lesson, award XP, update streak */
export const completeLesson = (lessonId: number, mistakesCount: number) =>
  apiFetch<LessonCompleteResponse>(`/api/lessons/${lessonId}/complete`, {
    method: "POST",
    body: JSON.stringify({ mistakes_count: mistakesCount }),
  });

/** POST /api/dev/simulate-day — Advance simulated date (dev tool) */
export const simulateDay = (days = 1) =>
  apiFetch<{ previous_date: string; current_date: string; days_advanced: number }>("/api/dev/simulate-day", {
    method: "POST",
    body: JSON.stringify({ days }),
  });

/** POST /api/dev/reset — Reset user progress and reseed initial state */
export const resetProgress = () =>
  apiFetch<{ message: string; date: string }>("/api/dev/reset", {
    method: "POST",
  });
