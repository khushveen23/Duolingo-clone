from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(Integer, ForeignKey("units.id"), nullable=False)
    order = Column(Integer, nullable=False, default=1)
    title = Column(String, nullable=False)
    icon = Column(String, nullable=False, default="book")
    total_levels = Column(Integer, nullable=False, default=3)

    # Relationships
    unit = relationship("Unit", back_populates="skills")
    lessons = relationship("Lesson", back_populates="skill", order_by="Lesson.order", cascade="all, delete-orphan")
    progress = relationship("UserSkillProgress", back_populates="skill", cascade="all, delete-orphan")
