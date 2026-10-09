from datetime import date, timedelta
from app.models.user import User
from app.services.streak_service import streak_service
from app.services.date_service import date_service

def test_streak_first_time_user(db_session):
    """A user with no prior activity starts at streak 1."""
    user = User(name="Newbie", streak=0, last_active_date=None)
    today = date(2026, 1, 10)
    streak, inc = streak_service.update_streak_on_activity(user, today)
    assert streak == 1
    assert inc is True
    assert user.last_active_date == today

def test_streak_same_day_no_increment(db_session):
    """Multiple lesson completions on the same day maintain the streak without double-incrementing."""
    today = date(2026, 1, 10)
    user = User(name="Learner", streak=3, last_active_date=today)
    streak, inc = streak_service.update_streak_on_activity(user, today)
    assert streak == 3
    assert inc is False
    assert user.last_active_date == today

def test_streak_consecutive_day_increments(db_session):
    """Completing a lesson on the next consecutive day increments streak by +1."""
    yesterday = date(2026, 1, 10)
    today = date(2026, 1, 11)
    user = User(name="Learner", streak=3, last_active_date=yesterday)
    streak, inc = streak_service.update_streak_on_activity(user, today)
    assert streak == 4
    assert inc is True
    assert user.last_active_date == today

def test_streak_missed_day_resets_to_one(db_session):
    """Missing one or more days breaks the streak and resets it back to 1."""
    two_days_ago = date(2026, 1, 9)
    today = date(2026, 1, 11)
    user = User(name="Learner", streak=5, last_active_date=two_days_ago)
    streak, inc = streak_service.update_streak_on_activity(user, today)
    assert streak == 1
    assert inc is True
    assert user.last_active_date == today

def test_multi_day_streak_simulation(client):
    """Simulates 3 consecutive days via API to verify streak advances correctly."""
    # Day 0: User starts at streak 3 (seeded with today's activity)
    res = client.get("/api/me")
    assert res.status_code == 200
    initial_streak = res.json()["streak"]
    assert initial_streak == 3

    # Advance 1 day
    client.post("/api/dev/simulate-day", json={"days": 1})
    # Complete lesson 1
    res_complete = client.post("/api/lessons/1/complete", json={"mistakes_count": 0})
    assert res_complete.status_code == 200
    assert res_complete.json()["streak"] == 4

    # Complete another lesson on the same day: streak remains 4
    res_complete2 = client.post("/api/lessons/1/complete", json={"mistakes_count": 0})
    assert res_complete2.status_code == 200
    assert res_complete2.json()["streak"] == 4

    # Advance 1 more day
    client.post("/api/dev/simulate-day", json={"days": 1})
    res_complete3 = client.post("/api/lessons/1/complete", json={"mistakes_count": 0})
    assert res_complete3.status_code == 200
    assert res_complete3.json()["streak"] == 5

    # Skip 2 full days without playing
    client.post("/api/dev/simulate-day", json={"days": 2})
    res_complete4 = client.post("/api/lessons/1/complete", json={"mistakes_count": 0})
    assert res_complete4.status_code == 200
    assert res_complete4.json()["streak"] == 1  # Reset to 1!
