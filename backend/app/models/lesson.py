from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    order = Column(Integer, nullable=False, default=1)
    level = Column(Integer, nullable=False, default=1)

    # Relationships
    skill = relationship("Skill", back_populates="lessons")
    exercises = relationship("Exercise", back_populates="lesson", order_by="Exercise.order", cascade="all, delete-orphan")
    progress = relationship("UserLessonProgress", back_populates="lesson", cascade="all, delete-orphan")
