from datetime import datetime, date, timedelta, timezone

class DateService:
    """
    Date management service supporting a simulated calendar offset.
    This enables seamless testing and demoing of multi-day streak logic,
    streak freeze, and daily goal resets without manipulating the system clock.
    """
    _simulated_days_offset: int = 0

    @classmethod
    def get_offset(cls) -> int:
        return cls._simulated_days_offset

    @classmethod
    def set_offset(cls, days: int) -> None:
        cls._simulated_days_offset = days

    @classmethod
    def advance_days(cls, days: int = 1) -> int:
        cls._simulated_days_offset += days
        return cls._simulated_days_offset

    @classmethod
    def reset_offset(cls) -> None:
        cls._simulated_days_offset = 0

    @classmethod
    def now_utc(cls) -> datetime:
        """Returns the current UTC datetime adjusted by the simulated offset."""
        base_now = datetime.now(timezone.utc)
        return base_now + timedelta(days=cls._simulated_days_offset)

    @classmethod
    def today_date(cls) -> date:
        """Returns the current calendar date adjusted by the simulated offset."""
        return cls.now_utc().date()

date_service = DateService()
