from pydantic import BaseModel
from app.schemas.exercise import ExerciseClientResponse


class LessonDetailResponse(BaseModel):
    id: int
    skill_id: int
    skill_title: str
    order: int
    level: int
    total_exercises: int
    exercises: list[ExerciseClientResponse]


class LessonCompleteRequest(BaseModel):
    mistakes_count: int = 0


class NewlyUnlockedAchievement(BaseModel):
    id: int
    code: str
    title: str
    description: str
    icon: str


class LessonCompleteResponse(BaseModel):
    xp_earned: int
    is_perfect: bool
    total_xp: int
    weekly_xp: int
    streak: int
    longest_streak: int
    daily_goal_target: int
    daily_goal_progress: int
    daily_goal_reached: bool
    skill_completed: bool
    next_skill_unlocked_id: int | None
    newly_unlocked_achievements: list[NewlyUnlockedAchievement] = []
