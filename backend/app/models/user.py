from datetime import datetime, date, timezone
from sqlalchemy import Column, Integer, String, Date, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, default="Learner")
    xp = Column(Integer, default=0, nullable=False)
    weekly_xp = Column(Integer, default=0, nullable=False)
    streak = Column(Integer, default=0, nullable=False)
    longest_streak = Column(Integer, default=0, nullable=False)
    last_active_date = Column(Date, nullable=True)
    hearts = Column(Integer, default=5, nullable=False)
    hearts_updated_at = Column(DateTime, default=utc_now, nullable=False)
    gems = Column(Integer, default=500, nullable=False)
    daily_goal_xp = Column(Integer, default=20, nullable=False)
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    # Relationships
    skill_progress = relationship("UserSkillProgress", back_populates="user", cascade="all, delete-orphan")
    lesson_progress = relationship("UserLessonProgress", back_populates="user", cascade="all, delete-orphan")
    xp_events = relationship("XPEvent", back_populates="user", cascade="all, delete-orphan")
    achievements = relationship("UserAchievement", back_populates="user", cascade="all, delete-orphan")
