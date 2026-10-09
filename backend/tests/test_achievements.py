from app.models.achievement import Achievement
from app.models.user import User
from app.models.progress import UserLessonProgress
from app.models.lesson import Lesson
from app.services.achievement_service import achievement_service


def test_first_lesson_achievement_is_awarded_once(db_session):
    user = User(name="Achievement learner", xp=0, streak=0, daily_goal_xp=20)
    db_session.add(user)
    db_session.flush()
    achievement_service.ensure_achievements_seeded(db_session)
    db_session.flush()

    first_lesson = db_session.query(Achievement).filter_by(code="first_lesson").one()
    assert first_lesson.target_value == 1
    # One completed lesson is the qualifying progress value.
    lesson = db_session.query(Lesson).first()
    db_session.add(UserLessonProgress(user_id=user.id, lesson_id=lesson.id, xp_earned=15))
    db_session.flush()
    newly_earned = achievement_service.evaluate_and_award(
        db_session, user, is_perfect=True
    )
    assert any(item["code"] == "first_lesson" for item in newly_earned)
    assert any(item["code"] == "flawless_1" for item in newly_earned)

    again = achievement_service.evaluate_and_award(db_session, user, is_perfect=True)
    assert all(item["code"] not in {"first_lesson", "flawless_1"} for item in again)
