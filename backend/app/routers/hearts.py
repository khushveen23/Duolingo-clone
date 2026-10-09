from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.models.user import User
from app.schemas.hearts import HeartRefillResponse, HeartPracticeResponse
from app.services.hearts_service import hearts_service, HEART_REFILL_GEM_COST
from app.routers.me import get_current_user

router = APIRouter(prefix="", tags=["Hearts"])


@router.post("/hearts/refill", response_model=HeartRefillResponse)
def refill_hearts_endpoint(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Full heart refill costing 350 gems.

    Returns 400 if:
      - User has fewer than 350 gems (insufficient balance).
      - User already has full hearts (no-op).
    """
    current_hearts, _ = hearts_service.calculate_hearts(user)
    if current_hearts >= settings.MAX_HEARTS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Hearts are already full.",
        )

    try:
        new_hearts = hearts_service.refill_hearts(user, cost_gems=HEART_REFILL_GEM_COST)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    db.commit()
    db.refresh(user)

    _, seconds_until_next = hearts_service.calculate_hearts(user)

    return HeartRefillResponse(
        message="Hearts refilled to maximum!",
        hearts=new_hearts,
        max_hearts=settings.MAX_HEARTS,
        gems=user.gems,
        seconds_until_next_heart=seconds_until_next,
    )


@router.post("/hearts/practice", response_model=HeartPracticeResponse)
def practice_refill_endpoint(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Practice refill: awards +1 heart for free (simulates earning hearts by practising).
    Returns 400 if hearts are already full.
    """
    current_hearts, _ = hearts_service.calculate_hearts(user)
    if current_hearts >= settings.MAX_HEARTS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Hearts are already full.",
        )

    new_hearts = hearts_service.practice_refill(user)
    db.commit()
    db.refresh(user)

    _, seconds_until_next = hearts_service.calculate_hearts(user)

    return HeartPracticeResponse(
        message="You earned a heart through practice!",
        hearts=new_hearts,
        max_hearts=settings.MAX_HEARTS,
        seconds_until_next_heart=seconds_until_next,
    )
