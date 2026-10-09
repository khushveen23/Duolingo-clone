from app.models.exercise import Exercise
from app.services.exercise_service import exercise_service

def test_grading_multiple_choice():
    ex = Exercise(
        id=1,
        lesson_id=1,
        type="multiple_choice",
        prompt="Select 'the boy'",
        data={"options": ["El niño", "La niña"], "correct_answer": "El niño", "explanation": "Boy in Spanish"},
    )
    # Correct answer
    ok, ans, exp = exercise_service.validate_answer(ex, "El niño")
    assert ok is True
    assert ans == "El niño"

    # Case insensitive match
    ok2, _, _ = exercise_service.validate_answer(ex, "el niño")
    assert ok2 is True

    # Incorrect answer
    ok3, _, _ = exercise_service.validate_answer(ex, "La niña")
    assert ok3 is False

def test_grading_translate_word_bank():
    ex = Exercise(
        id=2,
        lesson_id=1,
        type="translate_word_bank",
        prompt="Translate: 'The girl drinks water'",
        data={
            "word_bank": ["La", "niña", "bebe", "agua", "come"],
            "correct_answer": ["La", "niña", "bebe", "agua"],
            "explanation": "Translates directly",
        },
    )
    # Correct submission as list of tokens
    ok, _, _ = exercise_service.validate_answer(ex, ["La", "niña", "bebe", "agua"])
    assert ok is True

    # Correct submission as space-joined string
    ok2, _, _ = exercise_service.validate_answer(ex, "La niña bebe agua")
    assert ok2 is True

    # Incorrect word order or tokens
    ok3, _, _ = exercise_service.validate_answer(ex, ["La", "niña", "come", "agua"])
    assert ok3 is False

def test_grading_match_pairs():
    ex = Exercise(
        id=3,
        lesson_id=1,
        type="match_pairs",
        prompt="Match pairs",
        data={
            "pairs": [
                {"left": "water", "right": "agua"},
                {"left": "bread", "right": "pan"},
            ],
            "explanation": "Matched pairs",
        },
    )
    # Correct dictionary mapping
    ok, _, _ = exercise_service.validate_answer(ex, {"water": "agua", "bread": "pan"})
    assert ok is True

    # Correct list of pairs
    ok2, _, _ = exercise_service.validate_answer(ex, [{"left": "water", "right": "agua"}, {"left": "bread", "right": "pan"}])
    assert ok2 is True

    # Wrong pair
    ok3, _, _ = exercise_service.validate_answer(ex, {"water": "pan", "bread": "agua"})
    assert ok3 is False

def test_grading_fill_in_blank():
    ex = Exercise(
        id=4,
        lesson_id=1,
        type="fill_in_blank",
        prompt="Complete the sentence",
        data={
            "sentence": "Yo ___ un hombre.",
            "options": ["soy", "eres", "es"],
            "correct_answer": "soy",
        },
    )
    ok, _, _ = exercise_service.validate_answer(ex, "soy")
    assert ok is True

    ok2, _, _ = exercise_service.validate_answer(ex, "eres")
    assert ok2 is False

def test_grading_type_answer_fuzzy_matching():
    ex = Exercise(
        id=5,
        lesson_id=1,
        type="type_answer",
        prompt="Type in Spanish: 'I drink water'",
        data={
            "sentence_to_translate": "I drink water",
            "correct_answer": "Yo bebo agua",
            "acceptable_answers": ["bebo agua"],
        },
    )
    # Exact match
    ok1, _, _ = exercise_service.validate_answer(ex, "Yo bebo agua")
    assert ok1 is True

    # Acceptable alternative
    ok2, _, _ = exercise_service.validate_answer(ex, "bebo agua")
    assert ok2 is True

    # Case & punctuation lenient
    ok3, _, _ = exercise_service.validate_answer(ex, "  yo bebo agua.  ")
    assert ok3 is True

    # Incorrect
    ok4, _, _ = exercise_service.validate_answer(ex, "yo como pan")
    assert ok4 is False

def test_sanitization_does_not_leak_answers():
    """Client sanitized payload must not leak correct answers."""
    ex_mc = Exercise(
        id=10,
        lesson_id=1,
        type="multiple_choice",
        prompt="Test prompt",
        data={"options": ["A", "B", "C"], "correct_answer": "B", "explanation": "Secret explanation"},
    )
    safe_data = exercise_service.sanitize_for_client(ex_mc)
    assert "correct_answer" not in safe_data
    assert "explanation" not in safe_data
    assert "options" in safe_data
    assert set(safe_data["options"]) == {"A", "B", "C"}
