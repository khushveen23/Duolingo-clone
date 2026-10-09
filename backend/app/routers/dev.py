from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.dev import SimulateDayRequest, SimulateDayResponse, DevStateResponse
from app.services.date_service import date_service

router = APIRouter(prefix="/dev", tags=["Developer Utilities"])


@router.post("/simulate-day", response_model=SimulateDayResponse)
def simulate_day(payload: SimulateDayRequest = SimulateDayRequest()):
    """
    Advances the simulated global calendar date by N days.
    This lets evaluators test streak increment/break, daily goal reset,
    and weekly XP reset without manipulating the system clock.
    """
    new_offset = date_service.advance_days(payload.days)
    return SimulateDayResponse(
        message=f"Simulated date advanced by {payload.days} day(s).",
        simulated_date_offset_days=new_offset,
        simulated_today=date_service.today_date(),
        simulated_now=date_service.now_utc(),
    )


@router.get("/state", response_model=DevStateResponse)
def get_dev_state():
    """Returns the current simulated date offset and effective calendar date."""
    return DevStateResponse(
        simulated_date_offset_days=date_service.get_offset(),
        simulated_today=date_service.today_date(),
        simulated_now=date_service.now_utc(),
        system_date=date.today(),
    )


@router.post("/reset", response_model=DevStateResponse)
def reset_dev_state(db: Session = Depends(get_db)):
    """
    Resets the simulated date offset to 0 AND wipes all learner progress
    (XP events, lesson progress, skill progress, achievements, streak)
    so evaluators can run a clean end-to-end walkthrough at any time.

    NOTE: Course content (lessons, exercises) is preserved.
    """
    from app.models.user import User
    from app.models.xp_event import XPEvent
    from app.models.progress import UserLessonProgress, UserSkillProgress
    from app.models.achievement import UserAchievement
    from app.services.progress_service import progress_service

    date_service.reset_offset()

    # 1. Delete all event / progress rows for the default user
    user = db.query(User).filter_by(id=1).first()
    if user:
        db.query(XPEvent).filter_by(user_id=user.id).delete()
        db.query(UserLessonProgress).filter_by(user_id=user.id).delete()
        db.query(UserSkillProgress).filter_by(user_id=user.id).delete()
        db.query(UserAchievement).filter_by(user_id=user.id).delete()

        # 2. Reset user counters
        user.xp = 0
        user.weekly_xp = 0
        user.streak = 0
        user.longest_streak = 0
        user.last_active_date = None
        user.hearts = 5
        user.gems = 500

        db.commit()

        # 3. Re-unlock the first skill so there is something to practice
        progress_service.ensure_first_skill_available(db, user)
        db.commit()

    return DevStateResponse(
        simulated_date_offset_days=0,
        simulated_today=date_service.today_date(),
        simulated_now=date_service.now_utc(),
        system_date=date.today(),
    )
