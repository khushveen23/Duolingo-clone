from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.path import PathResponse
from app.services.progress_service import progress_service
from app.routers.me import get_current_user

router = APIRouter(prefix="", tags=["Path"])

@router.get("/path", response_model=PathResponse)
def get_path(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns the complete learning tree (Course -> Units -> Skills -> Lessons)
    with the current user's progress and lock/unlock status.
    """
    return progress_service.get_learning_path(db, user)
