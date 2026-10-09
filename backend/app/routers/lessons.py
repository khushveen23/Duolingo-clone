from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.lesson import Lesson
from app.schemas.lesson import LessonDetailResponse, LessonCompleteRequest, LessonCompleteResponse
from app.schemas.exercise import ExerciseClientResponse, AnswerSubmitRequest, AnswerResponse
from app.services.exercise_service import exercise_service
from app.services.lesson_service import lesson_service
from app.routers.me import get_current_user

router = APIRouter(prefix="/lessons", tags=["Lessons"])

@router.get("/{lesson_id}", response_model=LessonDetailResponse)
def get_lesson_detail(
    lesson_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Retrieves the lesson and its exercises.
    Exercises are sanitized to remove correct answers before sending to the client.
    """
    lesson = db.query(Lesson).filter_by(id=lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

    sanitized_exercises = []
    for ex in lesson.exercises:
        safe_data = exercise_service.sanitize_for_client(ex)
        sanitized_exercises.append(
            ExerciseClientResponse(
                id=ex.id,
                lesson_id=ex.lesson_id,
                order=ex.order,
                type=ex.type,
                prompt=ex.prompt,
                data=safe_data,
            )
        )

    return LessonDetailResponse(
        id=lesson.id,
        skill_id=lesson.skill_id,
        skill_title=lesson.skill.title if lesson.skill else "",
        order=lesson.order,
        level=lesson.level,
        total_exercises=len(sanitized_exercises),
        exercises=sanitized_exercises,
    )

@router.post("/{lesson_id}/answer", response_model=AnswerResponse)
def submit_exercise_answer(
    lesson_id: int,
    payload: AnswerSubmitRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Submits an exercise answer for server-side evaluation.
    Deducts 1 heart on a wrong answer. Returns lesson_failed=True if hearts reach 0.
    """
    try:
        result = lesson_service.answer_exercise(
            db=db,
            user=user,
            lesson_id=lesson_id,
            exercise_id=payload.exercise_id,
            answer=payload.answer,
        )
        return AnswerResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/{lesson_id}/complete", response_model=LessonCompleteResponse)
def complete_lesson_endpoint(
    lesson_id: int,
    payload: LessonCompleteRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Completes a lesson: awards XP (+perfect bonus), records XPEvent, updates streak,
    updates lesson progress, checks skill completion and unlocks next skill if complete.
    """
    try:
        result = lesson_service.complete_lesson(
            db=db,
            user=user,
            lesson_id=lesson_id,
            mistakes_count=payload.mistakes_count,
        )
        return LessonCompleteResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
