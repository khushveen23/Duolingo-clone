"""
Achievement service — Phase 4.

Responsibilities:
  - Define the canonical catalogue of 8+ seeded achievements.
  - ensure_achievements_seeded() is called at startup so the table is
    always populated before any query.
  - evaluate_and_award() runs after every lesson completion; it checks
    all un-earned achievements and returns a list of newly-unlocked ones
    so the /complete endpoint can forward them to the client for toast
    animations.
"""

from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.achievement import Achievement, UserAchievement
from app.models.progress import UserLessonProgress, UserSkillProgress
from app.services.date_service import date_service


class AchievementService:
    # ── Canonical achievement catalogue ─────────────────────────────────
    SEED_ACHIEVEMENTS = [
        {
            "code": "first_lesson",
            "title": "First Lesson",
            "description": "Complete your first lesson",
            "icon": "book-open",
            "target_value": 1,
            "category": "lessons",
        },
        {
            "code": "wildfire_3",
            "title": "Wildfire I",
            "description": "Reach a 3-day streak",
            "icon": "flame",
            "target_value": 3,
            "category": "streak",
        },
        {
            "code": "wildfire_7",
            "title": "Wildfire II",
            "description": "Reach a 7-day streak",
            "icon": "flame",
            "target_value": 7,
            "category": "streak",
        },
        {
            "code": "sage_100",
            "title": "Sage I",
            "description": "Earn 100 Total XP",
            "icon": "zap",
            "target_value": 100,
            "category": "xp",
        },
        {
            "code": "sage_500",
            "title": "Sage II",
            "description": "Earn 500 Total XP",
            "icon": "zap",
            "target_value": 500,
            "category": "xp",
        },
        {
            "code": "flawless_1",
            "title": "Sharpshooter",
            "description": "Complete a lesson with no mistakes",
            "icon": "target",
            "target_value": 1,
            "category": "perfect",
        },
        {
            "code": "unit_champion",
            "title": "Champion",
            "description": "Complete all skills in a unit",
            "icon": "trophy",
            "target_value": 1,
            "category": "unit",
        },
        {
            "code": "goal_getter",
            "title": "Goal Getter",
            "description": "Reach your daily XP goal",
            "icon": "star",
            "target_value": 1,
            "category": "daily_goal",
        },
    ]

    # ── Seeding ──────────────────────────────────────────────────────────

    @classmethod
    def ensure_achievements_seeded(cls, db: Session) -> None:
        """Idempotently inserts any missing achievement definitions."""
        for data in cls.SEED_ACHIEVEMENTS:
            existing = db.query(Achievement).filter_by(code=data["code"]).first()
            if not existing:
                db.add(Achievement(**data))
        db.flush()

    # ── Core evaluation ──────────────────────────────────────────────────

    @classmethod
    def evaluate_and_award(
        cls,
        db: Session,
        user: User,
        is_perfect: bool = False,
        unit_completed: bool = False,
        daily_goal_reached: bool = False,
    ) -> list[dict]:
        """
        Evaluates user progress against every achievement definition and
        unlocks any that are newly satisfied.

        Called after every lesson completion so XP, streak, lesson-count,
        and event-triggered achievements are checked in one place.

        Returns:
            list[dict] — newly-unlocked achievements for client toast/modal.
            Each dict has: id, code, title, description, icon.
        """
        cls.ensure_achievements_seeded(db)
        now = date_service.now_utc()

        all_achievements = db.query(Achievement).all()
        # Build a set of already-earned achievement IDs
        earned_ids: set[int] = {
            ua.achievement_id
            for ua in db.query(UserAchievement).filter_by(user_id=user.id).all()
        }

        completed_lessons_count = (
            db.query(UserLessonProgress).filter_by(user_id=user.id).count()
        )

        newly_unlocked: list[dict] = []

        for ach in all_achievements:
            if ach.id in earned_ids:
                continue  # Already unlocked — skip

            should_unlock = False
            current_progress = 0

            if ach.category == "lessons":
                current_progress = completed_lessons_count
                should_unlock = completed_lessons_count >= ach.target_value

            elif ach.category == "streak":
                current_progress = user.streak
                should_unlock = user.streak >= ach.target_value

            elif ach.category == "xp":
                current_progress = user.xp
                should_unlock = user.xp >= ach.target_value

            elif ach.category == "perfect":
                current_progress = 1 if is_perfect else 0
                should_unlock = is_perfect

            elif ach.category == "unit":
                current_progress = 1 if unit_completed else 0
                should_unlock = unit_completed

            elif ach.category == "daily_goal":
                current_progress = 1 if daily_goal_reached else 0
                should_unlock = daily_goal_reached

            if should_unlock:
                ua = UserAchievement(
                    user_id=user.id,
                    achievement_id=ach.id,
                    unlocked_at=now,
                    progress=current_progress,
                )
                db.add(ua)
                newly_unlocked.append(
                    {
                        "id": ach.id,
                        "code": ach.code,
                        "title": ach.title,
                        "description": ach.description,
                        "icon": ach.icon,
                    }
                )

        return newly_unlocked


achievement_service = AchievementService()
