from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Unit(Base):
    __tablename__ = "units"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    order = Column(Integer, nullable=False, default=1)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)

    # Relationships
    course = relationship("Course", back_populates="units")
    skills = relationship("Skill", back_populates="unit", order_by="Skill.order", cascade="all, delete-orphan")
