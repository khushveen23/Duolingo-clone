from datetime import timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.achievement import Achievement, UserAchievement
from app.models.progress import UserLessonProgress, UserSkillProgress
from app.models.xp_event import XPEvent
from app.models.course import Course
from app.schemas.profile import (
    ProfileResponse,
    AchievementProgressResponse,
    XPHistoryEntry,
    StreakResponse,
    StreakDayResponse,
)
from app.routers.me import get_current_user
from app.services.streak_service import streak_service
from app.services.date_service import date_service

router = APIRouter(prefix="", tags=["Profile"])


def _build_xp_history(db: Session, user_id: int) -> list[XPHistoryEntry]:
    """
    Aggregates XP earned per day for the last 7 calendar days (simulated-date aware).
    Returns a list of 7 XPHistoryEntry objects, oldest first.
    """
    today = date_service.today_date()
    days = [today - timedelta(days=6 - i) for i in range(7)]

    xp_events = db.query(XPEvent).filter(XPEvent.user_id == user_id).all()

    # Group by date
    xp_by_date: dict[str, int] = {}
    for ev in xp_events:
        ev_date = ev.created_at.date() if hasattr(ev.created_at, "date") else ev.created_at
        key = ev_date.isoformat()
        xp_by_date[key] = xp_by_date.get(key, 0) + ev.amount

    history = []
    for d in days:
        key = d.isoformat()
        history.append(
            XPHistoryEntry(
                date=key,
                day_label=d.strftime("%a")[0],
                xp=xp_by_date.get(key, 0),
            )
        )
    return history


@router.get("/profile", response_model=ProfileResponse)
def get_user_profile(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Full user profile: stats (streak, longest_streak, XP, league),
    all achievements with per-achievement progress, and a 7-day XP history.
    """
    completed_lessons_count = (
        db.query(UserLessonProgress).filter_by(user_id=user.id).count()
    )
    completed_skills_count = (
        db.query(UserSkillProgress)
        .filter_by(user_id=user.id, status="completed")
        .count()
    )

    # Achievements
    all_achievements = db.query(Achievement).all()
    user_ach_map = {
        ua.achievement_id: ua
        for ua in db.query(UserAchievement).filter_by(user_id=user.id).all()
    }

    achievements_response = []
    for ach in all_achievements:
        ua = user_ach_map.get(ach.id)
        is_unlocked = ua is not None
        unlocked_at = ua.unlocked_at if ua else None

        # Current progress value for in-progress achievements
        current_val = 0
        if ach.category == "streak":
            current_val = user.streak
        elif ach.category == "xp":
            current_val = user.xp
        elif ach.category == "lessons":
            current_val = completed_lessons_count
        elif ach.category == "perfect":
            current_val = 1 if is_unlocked else 0
        else:
            current_val = ua.progress if ua else 0

        achievements_response.append(
            AchievementProgressResponse(
                id=ach.id,
                code=ach.code,
                title=ach.title,
                description=ach.description,
                icon=ach.icon,
                target_value=ach.target_value,
                category=ach.category,
                unlocked=is_unlocked,
                unlocked_at=unlocked_at,
                progress=min(current_val, ach.target_value),
            )
        )

    xp_history = _build_xp_history(db, user.id)

    return ProfileResponse(
        id=user.id,
        name=user.name,
        streak=user.streak,
        longest_streak=getattr(user, "longest_streak", 0),
        total_xp=user.xp,
        weekly_xp=user.weekly_xp,
        gems=user.gems,
        hearts=user.hearts,
        joined_date=user.created_at,
        avatar_url=user.avatar_url,
        completed_lessons_count=completed_lessons_count,
        completed_skills_count=completed_skills_count,
        achievements=achievements_response,
        xp_history=xp_history,
        courses=[{"id": course.id, "language": course.language, "title": course.title}
                 for course in db.query(Course).all()],
    )


@router.get("/streak", response_model=StreakResponse)
def get_streak_info(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns the user's current streak, longest streak, and activity status
    for each of the last 7 calendar days.  Used by the streak popover in the
    top bar.
    """
    week_activity = streak_service.get_week_activity(db, user)
    days = [StreakDayResponse(**d) for d in week_activity]
    return StreakResponse(
        current_streak=user.streak,
        longest_streak=getattr(user, "longest_streak", 0),
        days=days,
    )
