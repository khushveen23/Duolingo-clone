from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    language = Column(String, nullable=False, default="es")
    title = Column(String, nullable=False, default="Spanish")

    # Relationships
    units = relationship("Unit", back_populates="course", order_by="Unit.order", cascade="all, delete-orphan")
