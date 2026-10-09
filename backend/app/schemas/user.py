from datetime import date, datetime
from pydantic import BaseModel, ConfigDict


class UserStatsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    xp: int
    weekly_xp: int
    streak: int
    longest_streak: int
    last_active_date: date | None
    hearts: int
    max_hearts: int
    seconds_until_next_heart: int
    # ISO-8601 datetime string; client uses this for a live countdown timer
    hearts_next_regen_at: datetime | None
    gems: int
    daily_goal_xp: int
    daily_goal_progress: int
    daily_goal_reached: bool
    avatar_url: str | None


class UpdateSettingsRequest(BaseModel):
    """PATCH /api/me/settings — user-editable preferences."""
    name: str | None = None
    daily_goal_xp: int | None = None  # must be one of 10 / 20 / 30 / 50
