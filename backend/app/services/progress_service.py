from sqlalchemy.orm import Session
from app.models.course import Course
from app.models.unit import Unit
from app.models.skill import Skill
from app.models.lesson import Lesson
from app.models.progress import UserSkillProgress, UserLessonProgress
from app.models.user import User

class ProgressService:
    @staticmethod
    def get_or_create_user_skill_progress(db: Session, user_id: int, skill_id: int) -> UserSkillProgress:
        """Retrieves or creates a skill progress record for a user."""
        progress = db.query(UserSkillProgress).filter_by(user_id=user_id, skill_id=skill_id).first()
        if not progress:
            progress = UserSkillProgress(
                user_id=user_id,
                skill_id=skill_id,
                levels_completed=0,
                status="locked"
            )
            db.add(progress)
            db.commit()
            db.refresh(progress)
        return progress

    @classmethod
    def get_learning_path(cls, db: Session, user: User) -> dict:
        """
        Builds the complete hierarchical learning path for the user:
        Course -> Units -> Skills -> Lessons summary with progress state.
        """
        course = db.query(Course).first()
        if not course:
            return {"course": None, "units": []}

        # Fetch all progress for this user in batch
        user_skills_map = {
            p.skill_id: p for p in db.query(UserSkillProgress).filter_by(user_id=user.id).all()
        }
        user_lessons_set = {
            p.lesson_id for p in db.query(UserLessonProgress.lesson_id).filter_by(user_id=user.id).all()
        }

        units_data = []
        all_skills_in_order = []

        for unit in course.units:
            skills_data = []
            for skill in unit.skills:
                all_skills_in_order.append(skill)
                progress = user_skills_map.get(skill.id)
                status = progress.status if progress else "locked"
                levels_completed = progress.levels_completed if progress else 0

                # Check lesson completion count
                skill_lessons = skill.lessons
                total_lessons_count = len(skill_lessons)
                completed_lessons_count = sum(1 for l in skill_lessons if l.id in user_lessons_set)

                lessons_summary = [
                    {
                        "id": l.id,
                        "order": l.order,
                        "level": l.level,
                        "completed": (l.id in user_lessons_set),
                    }
                    for l in skill_lessons
                ]

                skills_data.append({
                    "id": skill.id,
                    "order": skill.order,
                    "title": skill.title,
                    "icon": skill.icon,
                    "total_levels": skill.total_levels,
                    "levels_completed": levels_completed,
                    "status": status,
                    "total_lessons": total_lessons_count,
                    "completed_lessons": completed_lessons_count,
                    "lessons": lessons_summary,
                })

            units_data.append({
                "id": unit.id,
                "order": unit.order,
                "title": unit.title,
                "description": unit.description,
                "skills": skills_data,
            })

        return {
            "course": {
                "id": course.id,
                "language": course.language,
                "title": course.title,
            },
            "units": units_data,
        }

    @classmethod
    def unlock_next_skill(cls, db: Session, user: User, completed_skill_id: int) -> Skill | None:
        """
        When a skill is completed, finds the next skill in sequence and unlocks it.
        """
        # Fetch all skills in order across all units
        all_skills = db.query(Skill).join(Unit).order_by(Unit.order, Skill.order).all()
        current_index = -1
        for idx, skill in enumerate(all_skills):
            if skill.id == completed_skill_id:
                current_index = idx
                break

        if current_index >= 0 and current_index + 1 < len(all_skills):
            next_skill = all_skills[current_index + 1]
            progress = db.query(UserSkillProgress).filter_by(user_id=user.id, skill_id=next_skill.id).first()
            if not progress:
                progress = UserSkillProgress(
                    user_id=user.id,
                    skill_id=next_skill.id,
                    levels_completed=0,
                    status="available"
                )
                db.add(progress)
            elif progress.status == "locked":
                progress.status = "available"
            db.commit()
            return next_skill

        return None

    @classmethod
    def ensure_first_skill_available(cls, db: Session, user: User) -> None:
        """
        Ensures the first skill in the course is marked 'available'.
        Called after progress reset so there is always something to practice.
        """
        first_skill = (
            db.query(Skill).join(Unit).order_by(Unit.order, Skill.order).first()
        )
        if not first_skill:
            return

        progress = (
            db.query(UserSkillProgress)
            .filter_by(user_id=user.id, skill_id=first_skill.id)
            .first()
        )
        if not progress:
            progress = UserSkillProgress(
                user_id=user.id,
                skill_id=first_skill.id,
                levels_completed=0,
                status="available",
            )
            db.add(progress)
        else:
            progress.status = "available"
            progress.levels_completed = 0


progress_service = ProgressService()
