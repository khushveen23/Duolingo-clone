from datetime import datetime, date
from pydantic import BaseModel


class AchievementProgressResponse(BaseModel):
    id: int
    code: str
    title: str
    description: str
    icon: str
    target_value: int
    category: str
    unlocked: bool
    unlocked_at: datetime | None
    progress: int


class XPHistoryEntry(BaseModel):
    date: str        # ISO date string e.g. "2026-10-09"
    day_label: str   # Single letter: "M", "T", "W" …
    xp: int          # total XP earned that day


class ProfileResponse(BaseModel):
    id: int
    name: str
    streak: int
    longest_streak: int
    total_xp: int
    weekly_xp: int
    gems: int
    hearts: int
    joined_date: datetime
    avatar_url: str | None
    completed_lessons_count: int
    completed_skills_count: int
    achievements: list[AchievementProgressResponse]
    xp_history: list[XPHistoryEntry] = []   # last 7 days
    courses: list[dict] = []


class StreakDayResponse(BaseModel):
    date: str
    day_label: str
    is_today: bool
    is_active: bool


class StreakResponse(BaseModel):
    current_streak: int
    longest_streak: int
    days: list[StreakDayResponse]  # last 7 days
