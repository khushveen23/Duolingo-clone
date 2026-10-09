from pydantic import BaseModel

class LessonSummary(BaseModel):
    id: int
    order: int
    level: int
    completed: bool

class SkillResponse(BaseModel):
    id: int
    order: int
    title: str
    icon: str
    total_levels: int
    levels_completed: int
    status: str  # locked, available, completed
    total_lessons: int
    completed_lessons: int
    lessons: list[LessonSummary]

class UnitResponse(BaseModel):
    id: int
    order: int
    title: str
    description: str | None
    skills: list[SkillResponse]

class CourseSummary(BaseModel):
    id: int
    language: str
    title: str

class PathResponse(BaseModel):
    course: CourseSummary | None
    units: list[UnitResponse]
