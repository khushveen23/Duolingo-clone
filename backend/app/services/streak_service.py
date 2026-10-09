from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.xp_event import XPEvent
from app.services.date_service import date_service


class StreakService:
    @staticmethod
    def update_streak_on_activity(user: User, current_date: date | None = None) -> tuple[int, bool]:
        """
        Updates the user's streak based on their daily activity and maintains
        longest_streak so the profile page can display it.

        Rules:
        1. Same day  → streak maintained, no double-increment.
        2. Next day  → streak +1, longest_streak updated if surpassed.
        3. Gap ≥ 2d  → streak resets to 1 (broken), longest_streak unchanged.

        Returns:
            (new_streak_count, streak_incremented_bool)
        """
        today = current_date or date_service.today_date()
        last_active = user.last_active_date

        if last_active is None:
            user.streak = 1
            user.last_active_date = today
            user.longest_streak = max(user.longest_streak or 0, 1)
            return user.streak, True

        if last_active == today:
            # Already counted today
            return user.streak, False

        yesterday = today - timedelta(days=1)
        if last_active == yesterday:
            user.streak += 1
            user.last_active_date = today
            user.longest_streak = max(user.longest_streak or 0, user.streak)
            return user.streak, True

        # Streak broken
        user.streak = 1
        user.last_active_date = today
        user.longest_streak = max(user.longest_streak or 0, 1)
        return user.streak, True

    @staticmethod
    def get_week_activity(db: Session, user: User) -> list[dict]:
        """
        Returns the last 7 calendar days (today last) with is_active True/False.
        A day is active if the user has at least one XP event on that date,
        OR if last_active_date equals that date (covers edge cases in tests).
        """
        today = date_service.today_date()
        days = [today - timedelta(days=6 - i) for i in range(7)]

        # Fetch all XP events for user
        xp_events = db.query(XPEvent).filter_by(user_id=user.id).all()
        active_dates: set[date] = set()
        for ev in xp_events:
            ev_date = ev.created_at.date() if hasattr(ev.created_at, "date") else ev.created_at
            active_dates.add(ev_date)

        # Also include last_active_date so a single-lesson day without XP events still shows as active
        if user.last_active_date:
            active_dates.add(user.last_active_date)

        result = []
        for d in days:
            result.append({
                "date": d.isoformat(),
                "day_label": d.strftime("%a")[0],  # M, T, W …
                "is_today": d == today,
                "is_active": d in active_dates,
            })
        return result


streak_service = StreakService()
