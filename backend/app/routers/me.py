from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.config import settings
from app.schemas.user import UserStatsResponse, UpdateSettingsRequest
from app.services.hearts_service import hearts_service
from app.services.lesson_service import lesson_service

router = APIRouter(prefix="", tags=["User"])

VALID_DAILY_GOALS = {10, 20, 30, 50}


def get_current_user(db: Session = Depends(get_db)) -> User:
    """Helper dependency returning the default logged-in learner."""
    user = db.query(User).filter_by(id=settings.DEFAULT_USER_ID).first()
    if not user:
        user = db.query(User).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active learner found. Please seed the database.",
        )
    return user


@router.get("/me", response_model=UserStatsResponse)
def get_current_user_stats(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns current user stats: XP, streak, hearts (with lazy regen),
    gems, daily goal progress, and the next heart regen timestamp.
    """
    # 1. Evaluate lazy heart regeneration
    current_hearts, seconds_until_next = hearts_service.calculate_hearts(user)
    db.commit()
    db.refresh(user)

    # 2. Next regen datetime (used by client countdown timer)
    next_regen_at = hearts_service.hearts_next_regen_at(user) if current_hearts < settings.MAX_HEARTS else None

    # 3. Today's XP towards daily goal
    today_xp = lesson_service.get_today_xp(db, user.id)
    daily_goal_reached = today_xp >= user.daily_goal_xp

    return UserStatsResponse(
        id=user.id,
        name=user.name,
        xp=user.xp,
        weekly_xp=user.weekly_xp,
        streak=user.streak,
        longest_streak=getattr(user, "longest_streak", 0),
        last_active_date=user.last_active_date,
        hearts=current_hearts,
        max_hearts=settings.MAX_HEARTS,
        seconds_until_next_heart=seconds_until_next,
        hearts_next_regen_at=next_regen_at,
        gems=user.gems,
        daily_goal_xp=user.daily_goal_xp,
        daily_goal_progress=today_xp,
        daily_goal_reached=daily_goal_reached,
        avatar_url=user.avatar_url,
    )


@router.patch("/me/settings", response_model=UserStatsResponse)
def update_user_settings(
    payload: UpdateSettingsRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    PATCH /api/me/settings — update display name and/or daily goal XP target.
    daily_goal_xp must be one of: 10, 20, 30, 50.
    """
    if payload.name is not None:
        name = payload.name.strip()
        if not name:
            raise HTTPException(status_code=400, detail="Name cannot be blank")
        user.name = name

    if payload.daily_goal_xp is not None:
        if payload.daily_goal_xp not in VALID_DAILY_GOALS:
            raise HTTPException(
                status_code=400,
                detail=f"daily_goal_xp must be one of {sorted(VALID_DAILY_GOALS)}",
            )
        user.daily_goal_xp = payload.daily_goal_xp

    db.commit()
    db.refresh(user)

    current_hearts, seconds_until_next = hearts_service.calculate_hearts(user)
    next_regen_at = hearts_service.hearts_next_regen_at(user) if current_hearts < settings.MAX_HEARTS else None
    today_xp = lesson_service.get_today_xp(db, user.id)

    return UserStatsResponse(
        id=user.id,
        name=user.name,
        xp=user.xp,
        weekly_xp=user.weekly_xp,
        streak=user.streak,
        longest_streak=getattr(user, "longest_streak", 0),
        last_active_date=user.last_active_date,
        hearts=current_hearts,
        max_hearts=settings.MAX_HEARTS,
        seconds_until_next_heart=seconds_until_next,
        hearts_next_regen_at=next_regen_at,
        gems=user.gems,
        daily_goal_xp=user.daily_goal_xp,
        daily_goal_progress=today_xp,
        daily_goal_reached=today_xp >= user.daily_goal_xp,
        avatar_url=user.avatar_url,
    )
