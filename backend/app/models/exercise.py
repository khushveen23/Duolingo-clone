from sqlalchemy import Column, Integer, String, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    order = Column(Integer, nullable=False, default=1)
    type = Column(String, nullable=False)  # multiple_choice, translate_word_bank, match_pairs, fill_in_blank, type_answer
    prompt = Column(String, nullable=False)
    data = Column(JSON, nullable=False)  # Holds options, correct_answer(s), word_bank, pairs, explanation

    # Relationships
    lesson = relationship("Lesson", back_populates="exercises")
