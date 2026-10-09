from typing import Any
from pydantic import BaseModel

class ExerciseClientResponse(BaseModel):
    id: int
    lesson_id: int
    order: int
    type: str  # multiple_choice, translate_word_bank, match_pairs, fill_in_blank, type_answer
    prompt: str
    data: dict[str, Any]  # Sanitized data without solutions

class AnswerSubmitRequest(BaseModel):
    exercise_id: int
    answer: Any

class AnswerResponse(BaseModel):
    is_correct: bool
    correct_answer: Any
    explanation: str | None
    hearts_remaining: int
    lesson_failed: bool
