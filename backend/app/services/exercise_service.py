import re
import unicodedata
import random
from typing import Any
from app.models.exercise import Exercise

class ExerciseService:
    @staticmethod
    def _normalize_text(text: str) -> str:
        """
        Normalizes text for fuzzy typing comparisons:
        - strips leading/trailing whitespaces
        - converts to lowercase
        - removes surrounding punctuation (¿, ?, ¡, !, ., ,, ;, :, ", ')
        - collapses multiple spaces into one
        """
        if not text:
            return ""
        text = text.strip().lower()
        # Remove common punctuation symbols
        text = re.sub(r"[¿?¡!\.,;:\"'’()\[\]{}]", "", text)
        # Collapse multiple spaces
        text = re.sub(r"\s+", " ", text).strip()
        return text

    @staticmethod
    def _remove_accents(text: str) -> str:
        """Removes diacritics/accents for extra lenient fallback comparison."""
        return "".join(
            c for c in unicodedata.normalize("NFD", text)
            if unicodedata.category(c) != "Mn"
        )

    @classmethod
    def sanitize_for_client(cls, exercise: Exercise) -> dict[str, Any]:
        """
        Strips solution data and pre-computes safe client payloads
        so answers cannot be inspected in client network requests.
        """
        raw_data = exercise.data or {}
        exercise_type = exercise.type

        if exercise_type == "multiple_choice":
            options = list(raw_data.get("options", []))
            # Return shuffled options to prevent positional guessing
            shuffled_options = list(options)
            random.seed(exercise.id * 17)  # Deterministic shuffle per exercise
            random.shuffle(shuffled_options)
            return {
                "options": shuffled_options,
                "translation": raw_data.get("translation"),
            }

        elif exercise_type == "translate_word_bank":
            word_bank = list(raw_data.get("word_bank", []))
            shuffled_words = list(word_bank)
            random.seed(exercise.id * 31)
            random.shuffle(shuffled_words)
            return {
                "word_bank": shuffled_words,
                "target_language": raw_data.get("target_language", "es"),
            }

        elif exercise_type == "match_pairs":
            pairs = raw_data.get("pairs", [])
            left_items = [p["left"] for p in pairs]
            right_items = [p["right"] for p in pairs]
            
            # Shuffle right column deterministically
            shuffled_right = list(right_items)
            random.seed(exercise.id * 43)
            random.shuffle(shuffled_right)
            
            return {
                "left_items": left_items,
                "right_items": shuffled_right,
                "pairs": pairs,
            }

        elif exercise_type == "fill_in_blank":
            return {
                "sentence": raw_data.get("sentence"),
                "options": raw_data.get("options", []),
                "translation": raw_data.get("translation"),
            }

        elif exercise_type == "type_answer":
            return {
                "sentence_to_translate": raw_data.get("sentence_to_translate"),
                "target_language": raw_data.get("target_language", "es"),
                "hint": raw_data.get("hint"),
            }

        # Fallback for generic types
        safe_data = {k: v for k, v in raw_data.items() if not k.startswith("correct_") and k != "acceptable_answers"}
        return safe_data

    @classmethod
    def validate_answer(cls, exercise: Exercise, user_answer: Any) -> tuple[bool, Any, str | None]:
        """
        Evaluates the user's answer server-side against stored solutions.
        
        Returns:
            (is_correct: bool, correct_answer_display: Any, explanation: Optional[str])
        """
        raw_data = exercise.data or {}
        exercise_type = exercise.type
        explanation = raw_data.get("explanation")

        if exercise_type == "multiple_choice":
            correct = raw_data.get("correct_answer")
            is_correct = (
                str(user_answer).strip().lower() == str(correct).strip().lower()
            )
            return is_correct, correct, explanation

        elif exercise_type == "translate_word_bank":
            target_answer = raw_data.get("correct_answer")
            # Target may be list or string
            if isinstance(target_answer, list):
                target_str = " ".join(target_answer)
                target_list = target_answer
            else:
                target_str = str(target_answer)
                target_list = target_str.split()

            if isinstance(user_answer, list):
                user_str = " ".join(str(w) for w in user_answer)
            else:
                user_str = str(user_answer)

            is_correct = (
                cls._normalize_text(user_str) == cls._normalize_text(target_str)
            )
            return is_correct, target_str, explanation

        elif exercise_type == "match_pairs":
            pairs = raw_data.get("pairs", [])
            expected_map = {p["left"].strip().lower(): p["right"].strip().lower() for p in pairs}
            
            # user_answer can be list of dicts [{"left": "...", "right": "..."}, ...] or dict {"...": "..."}
            user_map = {}
            if isinstance(user_answer, dict):
                user_map = {str(k).strip().lower(): str(v).strip().lower() for k, v in user_answer.items()}
            elif isinstance(user_answer, list):
                for item in user_answer:
                    if isinstance(item, dict) and "left" in item and "right" in item:
                        user_map[str(item["left"]).strip().lower()] = str(item["right"]).strip().lower()

            is_correct = (user_map == expected_map)
            formatted_solution = ", ".join(f"{p['left']} = {p['right']}" for p in pairs)
            return is_correct, formatted_solution, explanation

        elif exercise_type == "fill_in_blank":
            correct = raw_data.get("correct_answer")
            is_correct = (
                cls._normalize_text(str(user_answer)) == cls._normalize_text(str(correct))
            )
            return is_correct, correct, explanation

        elif exercise_type == "type_answer":
            primary_correct = raw_data.get("correct_answer", "")
            acceptable = raw_data.get("acceptable_answers", [])
            all_valid = [primary_correct] + acceptable

            norm_user = cls._normalize_text(str(user_answer))
            is_correct = False

            # Strict comparison against normalized forms
            for valid in all_valid:
                if norm_user == cls._normalize_text(str(valid)):
                    is_correct = True
                    break

            # Lenient fallback (ignoring accents if accents omitted on keyboard)
            if not is_correct:
                unaccented_user = cls._remove_accents(norm_user)
                for valid in all_valid:
                    if unaccented_user == cls._remove_accents(cls._normalize_text(str(valid))):
                        is_correct = True
                        break

            return is_correct, primary_correct, explanation

        return False, None, "Unknown exercise type"

exercise_service = ExerciseService()
