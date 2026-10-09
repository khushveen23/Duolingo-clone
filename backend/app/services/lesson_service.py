from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.lesson import Lesson
from app.models.exercise import Exercise
from app.models.user import User
from app.models.progress import UserLessonProgress, UserSkillProgress
from app.models.xp_event import XPEvent
from app.services.exercise_service import exercise_service
from app.services.hearts_service import hearts_service
from app.services.streak_service import streak_service
from app.services.progress_service import progress_service
from app.services.date_service import date_service
from app.services.achievement_service import achievement_service


class LessonService:
    BASE_LESSON_XP = 10
    PERFECT_BONUS_XP = 5

    @classmethod
    def answer_exercise(
        cls, db: Session, user: User, lesson_id: int, exercise_id: int, answer: any
    ) -> dict:
        """
        Validates user answer for an exercise and updates hearts if incorrect.
        """
        exercise = db.query(Exercise).filter_by(id=exercise_id, lesson_id=lesson_id).first()
        if not exercise:
            raise ValueError("Exercise not found for this lesson")

        is_correct, correct_answer_display, explanation = exercise_service.validate_answer(
            exercise, answer
        )

        lesson_failed = False
        hearts_remaining = user.hearts

        if not is_correct:
            hearts_remaining, lesson_failed = hearts_service.deduct_heart(user)
            db.commit()
            db.refresh(user)

        return {
            "is_correct": is_correct,
            "correct_answer": correct_answer_display,
            "explanation": explanation,
            "hearts_remaining": hearts_remaining,
            "lesson_failed": lesson_failed,
        }

    @classmethod
    def get_today_xp(cls, db: Session, user_id: int) -> int:
        """Calculates total XP earned by the user today (simulated-date aware)."""
        today = date_service.today_date()
        events = db.query(XPEvent).filter(XPEvent.user_id == user_id).all()
        today_xp = sum(
            e.amount
            for e in events
            if (e.created_at.date() if hasattr(e.created_at, "date") else e.created_at) == today
        )
        return today_xp

    @classmethod
    def complete_lesson(
        cls, db: Session, user: User, lesson_id: int, mistakes_count: int = 0
    ) -> dict:
        """
        Completes a lesson:
          1. Award XP (+ perfect bonus)
          2. Record XPEvent
          3. Update user totals
          4. Update streak (and longest_streak)
          5. Record lesson progress
          6. Check skill / unit completion and unlock next skill
          7. Run achievement evaluation — returns newly unlocked
          8. Commit, recalculate today XP, build response

        Returns a dict that is serialised directly into LessonCompleteResponse.
        The `newly_unlocked_achievements` key is a list of achievement dicts
        for the client to show as toast/modal popups.
        """
        lesson = db.query(Lesson).filter_by(id=lesson_id).first()
        if not lesson:
            raise ValueError("Lesson not found")

        now = date_service.now_utc()
        today = date_service.today_date()

        # 1. XP calculation
        is_perfect = mistakes_count == 0
        xp_earned = cls.BASE_LESSON_XP + (cls.PERFECT_BONUS_XP if is_perfect else 0)

        # 2. Record XP Event
        db.add(XPEvent(user_id=user.id, amount=xp_earned, created_at=now))

        # 3. Update user totals
        user.xp += xp_earned
        user.weekly_xp += xp_earned

        # 4. Streak
        streak_count, streak_increased = streak_service.update_streak_on_activity(user, today)

        # 5. Lesson progress
        lesson_prog = (
            db.query(UserLessonProgress)
            .filter_by(user_id=user.id, lesson_id=lesson.id)
            .first()
        )
        if not lesson_prog:
            lesson_prog = UserLessonProgress(
                user_id=user.id,
                lesson_id=lesson.id,
                completed_at=now,
                xp_earned=xp_earned,
            )
            db.add(lesson_prog)
        else:
            lesson_prog.completed_at = now
            lesson_prog.xp_earned += xp_earned

        # 6. Skill completion check
        skill = lesson.skill
        skill_lessons = db.query(Lesson).filter_by(skill_id=skill.id).all()
        completed_lesson_ids = {
            p.lesson_id
            for p in db.query(UserLessonProgress).filter(
                UserLessonProgress.user_id == user.id,
                UserLessonProgress.lesson_id.in_([l.id for l in skill_lessons]),
            ).all()
        }
        completed_lesson_ids.add(lesson.id)  # include the one just finished

        skill_completed = False
        unit_completed = False
        next_skill_unlocked_id = None

        skill_prog = (
            db.query(UserSkillProgress).filter_by(user_id=user.id, skill_id=skill.id).first()
        )
        if not skill_prog:
            skill_prog = UserSkillProgress(
                user_id=user.id, skill_id=skill.id, levels_completed=0, status="available"
            )
            db.add(skill_prog)

        if len(completed_lesson_ids) >= len(skill_lessons):
            skill_completed = True
            skill_prog.status = "completed"
            skill_prog.levels_completed = skill.total_levels

            next_skill = progress_service.unlock_next_skill(db, user, skill.id)
            if next_skill:
                next_skill_unlocked_id = next_skill.id

            # Check if entire unit is now complete
            unit = skill.unit
            if unit:
                unit_skill_ids = [s.id for s in unit.skills]
                completed_skill_ids = {
                    sp.skill_id
                    for sp in db.query(UserSkillProgress).filter(
                        UserSkillProgress.user_id == user.id,
                        UserSkillProgress.skill_id.in_(unit_skill_ids),
                        UserSkillProgress.status == "completed",
                    ).all()
                }
                completed_skill_ids.add(skill.id)
                unit_completed = len(completed_skill_ids) >= len(unit_skill_ids)

        # Flush so achievement queries see the updated progress rows
        db.flush()

        # 7. Achievement evaluation — flush again, then commit
        today_xp_before_commit = cls.get_today_xp(db, user.id)
        daily_goal_reached = today_xp_before_commit >= user.daily_goal_xp

        newly_unlocked = achievement_service.evaluate_and_award(
            db=db,
            user=user,
            is_perfect=is_perfect,
            unit_completed=unit_completed,
            daily_goal_reached=daily_goal_reached,
        )

        db.commit()
        db.refresh(user)

        # 8. Recalculate today XP post-commit
        today_xp = cls.get_today_xp(db, user.id)
        daily_goal_reached = today_xp >= user.daily_goal_xp

        return {
            "xp_earned": xp_earned,
            "is_perfect": is_perfect,
            "total_xp": user.xp,
            "weekly_xp": user.weekly_xp,
            "streak": user.streak,
            "longest_streak": user.longest_streak,
            "daily_goal_target": user.daily_goal_xp,
            "daily_goal_progress": today_xp,
            "daily_goal_reached": daily_goal_reached,
            "skill_completed": skill_completed,
            "next_skill_unlocked_id": next_skill_unlocked_id,
            "newly_unlocked_achievements": newly_unlocked,
        }


lesson_service = LessonService()
