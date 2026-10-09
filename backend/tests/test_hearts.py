from datetime import datetime, timedelta, timezone
import pytest
from app.models.user import User
from app.services.hearts_service import hearts_service
from app.services.date_service import date_service

def test_hearts_at_maximum_caps_at_five(db_session):
    """Hearts cannot exceed maximum of 5."""
    user = User(name="Test", hearts=5, hearts_updated_at=datetime.now(timezone.utc))
    hearts, seconds_next = hearts_service.calculate_hearts(user)
    assert hearts == 5
    assert seconds_next == 0

def test_hearts_lazy_regeneration_after_30_minutes(db_session):
    """User with 3 hearts gains 1 heart after 35 minutes elapsed."""
    base_time = datetime(2026, 1, 1, 12, 0, tzinfo=timezone.utc)
    user = User(name="Test", hearts=3, hearts_updated_at=base_time)

    # 35 minutes later
    eval_time = base_time + timedelta(minutes=35)
    hearts, seconds_next = hearts_service.calculate_hearts(user, now=eval_time)
    assert hearts == 4
    # 25 minutes left until the 5th heart (1500 seconds)
    assert 1400 <= seconds_next <= 1500

def test_hearts_lazy_regeneration_after_two_hours_caps_at_five(db_session):
    """User with 2 hearts gains all 3 missing hearts after 2 hours (120 mins)."""
    base_time = datetime(2026, 1, 1, 12, 0, tzinfo=timezone.utc)
    user = User(name="Test", hearts=2, hearts_updated_at=base_time)

    eval_time = base_time + timedelta(hours=2)
    hearts, seconds_next = hearts_service.calculate_hearts(user, now=eval_time)
    assert hearts == 5
    assert seconds_next == 0

def test_hearts_deduction_and_lesson_failure(db_session):
    """Wrong answers decrement hearts down to 0, which triggers lesson failure."""
    user = User(name="Test", hearts=1, hearts_updated_at=datetime.now(timezone.utc))
    hearts, failed = hearts_service.deduct_heart(user)
    assert hearts == 0
    assert failed is True

def test_hearts_refill_api(client):
    """POST /api/hearts/refill refills hearts to 5."""
    # Deduct hearts by answering incorrectly
    res_ans = client.post("/api/lessons/1/answer", json={"exercise_id": 1, "answer": "Wrong Answer"})
    assert res_ans.status_code == 200
    assert res_ans.json()["hearts_remaining"] == 4

    # Call refill
    res_refill = client.post("/api/hearts/refill")
    assert res_refill.status_code == 200
    assert res_refill.json()["hearts"] == 5

    # Check /api/me reflects 5 hearts
    res_me = client.get("/api/me")
    assert res_me.status_code == 200
    assert res_me.json()["hearts"] == 5

def test_refill_rejects_insufficient_gems(db_session):
    user = User(name="Low gems", hearts=2, gems=100, hearts_updated_at=datetime.now(timezone.utc))
    with pytest.raises(ValueError, match="Insufficient gems"):
        hearts_service.refill_hearts(user, cost_gems=350)

def test_refill_rejects_full_hearts(db_session):
    user = User(name="Full hearts", hearts=5, gems=500, hearts_updated_at=datetime.now(timezone.utc))
    with pytest.raises(ValueError, match="already full"):
        hearts_service.refill_hearts(user, cost_gems=350)
