// TypeScript types that exactly mirror the Pydantic response models in the backend.
// Every field name and type matches what the API returns.

// ── /api/me ──────────────────────────────────────────────
export interface UserStats {
  id: number;
  name: string;
  xp: number;
  weekly_xp: number;
  streak: number;
  longest_streak: number;
  last_active_date: string | null;
  hearts: number;
  max_hearts: number;
  seconds_until_next_heart: number;
  hearts_next_regen_at: string | null;
  gems: number;
  daily_goal_xp: number;
  daily_goal_progress: number;
  daily_goal_reached: boolean;
  avatar_url: string | null;
}

export interface UpdateSettingsPayload {
  name?: string;
  daily_goal_xp?: number;
}

// ── /api/path ─────────────────────────────────────────────
export interface LessonSummary {
  id: number;
  order: number;
  level: number;
  completed: boolean;
}

export type SkillStatus = "locked" | "available" | "completed";

export interface SkillNode {
  id: number;
  order: number;
  title: string;
  icon: string;
  total_levels: number;
  levels_completed: number;
  status: SkillStatus;
  total_lessons: number;
  completed_lessons: number;
  lessons: LessonSummary[];
}

export interface UnitData {
  id: number;
  order: number;
  title: string;
  description: string | null;
  skills: SkillNode[];
}

export interface CourseSummary {
  id: number;
  language: string;
  title: string;
}

export interface PathData {
  course: CourseSummary | null;
  units: UnitData[];
}

// ── /api/leaderboard ──────────────────────────────────────
export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  name: string;
  weekly_xp: number;
  total_xp: number;
  streak: number;
  avatar_url: string;
  is_current_user: boolean;
}

export interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  current_user_rank: number | null;
  league_name: string;
  days_left: number;
}

// ── /api/profile ──────────────────────────────────────────
export interface AchievementProgress {
  id: number;
  code: string;
  title: string;
  description: string;
  icon: string;
  target_value: number;
  category: string;
  unlocked: boolean;
  unlocked_at: string | null;
  progress: number;
}

export interface XPHistoryEntry {
  date: string;
  day_label: string;
  xp: number;
}

export interface ProfileData {
  id: number;
  name: string;
  streak: number;
  longest_streak: number;
  total_xp: number;
  weekly_xp: number;
  gems: number;
  hearts: number;
  joined_date: string;
  avatar_url: string | null;
  completed_lessons_count: number;
  completed_skills_count: number;
  achievements: AchievementProgress[];
  xp_history: XPHistoryEntry[];
  courses: CourseSummary[];
}

// ── /api/streak ───────────────────────────────────────────
export interface StreakDay {
  date: string;
  day_label: string;
  is_today: boolean;
  is_active: boolean;
}

export interface StreakData {
  current_streak: number;
  longest_streak: number;
  days: StreakDay[];
}

// ── /api/hearts ───────────────────────────────────────────
export interface HeartRefillResponse {
  message: string;
  hearts: number;
  max_hearts: number;
  gems: number;
  seconds_until_next_heart: number;
}

export interface HeartPracticeResponse {
  message: string;
  hearts: number;
  max_hearts: number;
  seconds_until_next_heart: number;
}

// ── /api/lessons ──────────────────────────────────────────
export interface ExerciseClientData {
  options?: string[];
  word_bank?: string[];
  left_items?: string[];
  right_items?: string[];
  pairs?: Array<{ left: string; right: string }>;
  sentence?: string;
  translation?: string;
  sentence_to_translate?: string;
  target_language?: string;
  hint?: string;
}

export interface Exercise {
  id: number;
  lesson_id: number;
  order: number;
  type: "multiple_choice" | "translate_word_bank" | "match_pairs" | "fill_in_blank" | "type_answer";
  prompt: string;
  data: ExerciseClientData;
}

export interface LessonDetail {
  id: number;
  skill_id: number;
  skill_title: string;
  order: number;
  level: number;
  total_exercises: number;
  exercises: Exercise[];
}

export interface AnswerResponse {
  is_correct: boolean;
  correct_answer: unknown;
  explanation: string | null;
  hearts_remaining: number;
  lesson_failed: boolean;
}

export interface LessonCompleteResponse {
  xp_earned: number;
  is_perfect: boolean;
  total_xp: number;
  weekly_xp: number;
  streak: number;
  longest_streak: number;
  daily_goal_target: number;
  daily_goal_progress: number;
  daily_goal_reached: boolean;
  skill_completed: boolean;
  next_skill_unlocked_id: number | null;
  newly_unlocked_achievements: AchievementProgress[];
}
