from pydantic import BaseModel


class HeartRefillResponse(BaseModel):
    message: str
    hearts: int
    max_hearts: int
    gems: int
    seconds_until_next_heart: int


class HeartPracticeResponse(BaseModel):
    message: str
    hearts: int
    max_hearts: int
    seconds_until_next_heart: int
