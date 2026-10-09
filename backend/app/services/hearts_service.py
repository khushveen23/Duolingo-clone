from datetime import datetime, timedelta, timezone
from app.config import settings
from app.models.user import User
from app.services.date_service import date_service

HEART_REFILL_GEM_COST = 350  # gems required for a full refill


class HeartsService:
    @staticmethod
    def _normalize_datetime(dt: datetime) -> datetime:
        """Ensures datetime is timezone-aware UTC for consistent arithmetic."""
        if dt is None:
            return date_service.now_utc()
        if dt.tzinfo is None:
            return dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)

    @classmethod
    def calculate_hearts(cls, user: User, now: datetime | None = None) -> tuple[int, int]:
        """
        Lazily evaluates and updates the user's hearts based on elapsed time.

        Heart Mechanics:
        - Max hearts: 5
        - Regeneration rate: 1 heart per 30 minutes (1800 seconds)
        - Lazy Evaluation: We do not run background cron jobs.
          Whenever user stats are queried we calculate how many 30-minute
          blocks have passed since `hearts_updated_at`.

        Returns:
            (current_hearts, seconds_until_next_heart)
        """
        now = now or date_service.now_utc()
        hearts_updated_at = cls._normalize_datetime(user.hearts_updated_at)

        if user.hearts >= settings.MAX_HEARTS:
            user.hearts = settings.MAX_HEARTS
            user.hearts_updated_at = now
            return settings.MAX_HEARTS, 0

        regen_interval_seconds = settings.HEART_REGEN_MINUTES * 60
        elapsed_seconds = (now - hearts_updated_at).total_seconds()

        if elapsed_seconds < 0:
            elapsed_seconds = 0

        hearts_gained = int(elapsed_seconds // regen_interval_seconds)

        if hearts_gained > 0:
            user.hearts = min(settings.MAX_HEARTS, user.hearts + hearts_gained)
            if user.hearts >= settings.MAX_HEARTS:
                user.hearts = settings.MAX_HEARTS
                user.hearts_updated_at = now
            else:
                user.hearts_updated_at = hearts_updated_at + timedelta(
                    seconds=hearts_gained * regen_interval_seconds
                )

        if user.hearts >= settings.MAX_HEARTS:
            seconds_until_next = 0
        else:
            updated_normalized = cls._normalize_datetime(user.hearts_updated_at)
            time_in_current_block = (now - updated_normalized).total_seconds()
            seconds_until_next = max(
                0,
                int(regen_interval_seconds - (time_in_current_block % regen_interval_seconds)),
            )

        return user.hearts, seconds_until_next

    @classmethod
    def hearts_next_regen_at(cls, user: User, now: datetime | None = None) -> datetime:
        """Returns the UTC datetime when the next heart will be regenerated."""
        now = now or date_service.now_utc()
        _, secs = cls.calculate_hearts(user, now=now)
        return now + timedelta(seconds=secs)

    @classmethod
    def deduct_heart(cls, user: User) -> tuple[int, bool]:
        """
        Deducts 1 heart on a wrong exercise answer after applying lazy regeneration.
        Returns:
            (hearts_remaining, is_lesson_failed)
        """
        now = date_service.now_utc()
        cls.calculate_hearts(user, now=now)

        if user.hearts > 0:
            if user.hearts == settings.MAX_HEARTS:
                user.hearts_updated_at = now
            user.hearts -= 1

        is_lesson_failed = user.hearts <= 0
        return user.hearts, is_lesson_failed

    @classmethod
    def refill_hearts(cls, user: User, cost_gems: int = 0) -> int:
        """
        Refills hearts to maximum (5) and optionally deducts gems.

        Raises ValueError if:
          - cost_gems > 0 and user has fewer gems (insufficient balance)
          - hearts are already full (no-op, signal to caller)
        """
        now = date_service.now_utc()
        cls.calculate_hearts(user, now=now)  # apply any regen first

        if user.hearts >= settings.MAX_HEARTS:
            raise ValueError("Hearts are already full.")

        if cost_gems > 0:
            if user.gems < cost_gems:
                raise ValueError(
                    f"Insufficient gems: need {cost_gems}, have {user.gems}"
                )
            user.gems -= cost_gems

        user.hearts = settings.MAX_HEARTS
        user.hearts_updated_at = now
        return user.hearts

    @classmethod
    def practice_refill(cls, user: User) -> int:
        """
        Practice refill: grants exactly +1 heart (free, but does not exceed max).
        Used by the 'PRACTICE TO EARN HEARTS' button.
        """
        now = date_service.now_utc()
        cls.calculate_hearts(user, now=now)

        if user.hearts < settings.MAX_HEARTS:
            user.hearts += 1

        return user.hearts


hearts_service = HeartsService()
