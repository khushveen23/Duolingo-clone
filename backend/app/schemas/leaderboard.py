from pydantic import BaseModel


class LeaderboardEntry(BaseModel):
    rank: int
    user_id: int
    name: str
    weekly_xp: int
    total_xp: int
    streak: int
    avatar_url: str
    is_current_user: bool


class LeaderboardResponse(BaseModel):
    leaderboard: list[LeaderboardEntry]
    current_user_rank: int | None
    league_name: str = "Bronze"
    days_left: int  # days left in the current ISO week (resets on Monday)
