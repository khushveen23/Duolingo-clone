from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.leaderboard import LeaderboardResponse, LeaderboardEntry
from app.services.leaderboard_service import leaderboard_service
from app.routers.me import get_current_user
from app.services.date_service import date_service

router = APIRouter(prefix="", tags=["Leaderboard"])


def _days_left_in_week() -> int:
    """
    Returns the number of days remaining in the current ISO week
    (Monday = start, Sunday = end).  Minimum 1 so it never shows 0.
    """
    today = date_service.today_date()
    # isoweekday: Monday=1 … Sunday=7
    days_passed = today.isoweekday() - 1  # 0 on Monday, 6 on Sunday
    return max(1, 7 - days_passed)


@router.get("/leaderboard", response_model=LeaderboardResponse)
def get_leaderboard_endpoint(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns weekly leaderboard ranked by weekly XP.
    Includes league name, days left in the week, and the current user's rank.
    """
    entries = leaderboard_service.get_leaderboard(db, current_user=user)

    current_user_rank = None
    for item in entries:
        if item["is_current_user"]:
            current_user_rank = item["rank"]
            break

    return LeaderboardResponse(
        leaderboard=[LeaderboardEntry(**item) for item in entries],
        current_user_rank=current_user_rank,
        league_name="Bronze",
        days_left=_days_left_in_week(),
    )
