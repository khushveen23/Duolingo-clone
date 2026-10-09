def test_get_me_endpoint(client):
    """GET /api/me returns user stats with streak and hearts."""
    res = client.get("/api/me")
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "Learner"
    assert data["hearts"] == 5
    assert data["streak"] == 3
    assert data["gems"] == 500
    assert "daily_goal_progress" in data

def test_get_path_endpoint(client):
    """GET /api/path returns course, units, and skills hierarchy with statuses."""
    res = client.get("/api/path")
    assert res.status_code == 200
    data = res.json()
    assert data["course"]["title"] == "Spanish"
    assert len(data["units"]) == 3
    
    # Unit 1 skills should be completed
    unit1 = data["units"][0]
    assert unit1["skills"][0]["status"] == "completed"
    assert unit1["skills"][1]["status"] == "completed"

    # Unit 2 skill 1 (Food) should be available
    unit2 = data["units"][1]
    assert unit2["skills"][0]["status"] == "available"
    # Skill 2 (Family) should be locked
    assert unit2["skills"][1]["status"] == "locked"

def test_get_lesson_detail_sanitized(client):
    """GET /api/lessons/1 returns exercises with sanitized payload."""
    res = client.get("/api/lessons/1")
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == 1
    assert data["total_exercises"] >= 8
    
    # Ensure correct answers are stripped
    for ex in data["exercises"]:
        assert "correct_answer" not in ex["data"]
        assert "acceptable_answers" not in ex["data"]

def test_answer_submission_and_heart_cost(client):
    """POST /api/lessons/{id}/answer deducts 1 heart on incorrect answer."""
    # Correct answer for exercise 1 ("El niño")
    res_correct = client.post("/api/lessons/1/answer", json={
        "exercise_id": 1,
        "answer": "El niño"
    })
    assert res_correct.status_code == 200
    assert res_correct.json()["is_correct"] is True
    assert res_correct.json()["hearts_remaining"] == 5
    assert res_correct.json()["lesson_failed"] is False

    # Incorrect answer for exercise 1
    res_wrong = client.post("/api/lessons/1/answer", json={
        "exercise_id": 1,
        "answer": "La manzana"
    })
    assert res_wrong.status_code == 200
    assert res_wrong.json()["is_correct"] is False
    assert res_wrong.json()["hearts_remaining"] == 4
    assert res_wrong.json()["lesson_failed"] is False

def test_lesson_completion_and_gamification(client):
    """POST /api/lessons/{id}/complete awards XP, updates streak, checks daily goal."""
    # Complete lesson with 0 mistakes (perfect)
    res = client.post("/api/lessons/1/complete", json={"mistakes_count": 0})
    assert res.status_code == 200
    data = res.json()
    assert data["xp_earned"] == 15  # 10 base + 5 bonus
    assert data["is_perfect"] is True
    assert data["total_xp"] == 195  # 180 initial + 15
    assert data["daily_goal_progress"] >= 15

def test_leaderboard_endpoint(client):
    """GET /api/leaderboard returns ranked list including current user."""
    res = client.get("/api/leaderboard")
    assert res.status_code == 200
    data = res.json()
    assert "leaderboard" in data
    assert len(data["leaderboard"]) >= 10
    
    ranks = [entry["rank"] for entry in data["leaderboard"]]
    assert ranks == list(range(1, len(ranks) + 1))
    
    # Weekly XP should be in descending order
    weekly_xps = [entry["weekly_xp"] for entry in data["leaderboard"]]
    assert weekly_xps == sorted(weekly_xps, reverse=True)

def test_profile_endpoint(client):
    """GET /api/profile returns profile stats and achievements."""
    res = client.get("/api/profile")
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "Learner"
    assert len(data["achievements"]) >= 5
    unlocked = [a for a in data["achievements"] if a["unlocked"]]
    assert len(unlocked) >= 2  # Seeded with 2 unlocked achievements
