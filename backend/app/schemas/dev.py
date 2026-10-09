from datetime import date, datetime
from pydantic import BaseModel

class SimulateDayRequest(BaseModel):
    days: int = 1

class SimulateDayResponse(BaseModel):
    message: str
    simulated_date_offset_days: int
    simulated_today: date
    simulated_now: datetime

class DevStateResponse(BaseModel):
    simulated_date_offset_days: int
    simulated_today: date
    simulated_now: datetime
    system_date: date
