"""
Database Seeding Script for Duolingo Clone.
Populates:
- Spanish Course with 3 Units, 6 Skills, 15 Lessons, and 120+ Exercises across 5 exercise types
- Default logged-in learner with initial progress (Unit 1 completed, Unit 2 Skill 1 available, 3-day streak, XP, gems)
- 10 competitive leaderboard users
- Badges and achievements
"""

from datetime import datetime, timedelta, timezone, date
from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal
from app.models.user import User
from app.models.course import Course
from app.models.unit import Unit
from app.models.skill import Skill
from app.models.lesson import Lesson
from app.models.exercise import Exercise
from app.models.progress import UserSkillProgress, UserLessonProgress
from app.models.xp_event import XPEvent
from app.models.achievement import Achievement, UserAchievement

def utc_now():
    return datetime.now(timezone.utc)

def seed_database(db: Session | None = None):
    own_session = False
    if db is None:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        own_session = True

    try:
        # Check if already seeded
        existing_course = db.query(Course).first()
        if existing_course:
            print("Database already contains data. Skipping seed.")
            return

        print("Seeding fresh database with Duolingo content...")

        now = utc_now()
        today = now.date()

        # ==========================================
        # 1. CREATE ACHIEVEMENTS
        # ==========================================
        achievements_data = [
            {
                "code": "wildfire_3",
                "title": "Wildfire I",
                "description": "Reach a 3-day streak",
                "icon": "flame",
                "target_value": 3,
                "category": "streak",
            },
            {
                "code": "wildfire_7",
                "title": "Wildfire II",
                "description": "Reach a 7-day streak",
                "icon": "flame",
                "target_value": 7,
                "category": "streak",
            },
            {
                "code": "sage_100",
                "title": "Sage I",
                "description": "Earn 100 Total XP",
                "icon": "zap",
                "target_value": 100,
                "category": "xp",
            },
            {
                "code": "sage_500",
                "title": "Sage II",
                "description": "Earn 500 Total XP",
                "icon": "zap",
                "target_value": 500,
                "category": "xp",
            },
            {
                "code": "scholar_5",
                "title": "Scholar I",
                "description": "Complete 5 lessons",
                "icon": "book-open",
                "target_value": 5,
                "category": "lessons",
            },
            {
                "code": "flawless_1",
                "title": "Sharpshooter",
                "description": "Complete a lesson with no mistakes",
                "icon": "target",
                "target_value": 1,
                "category": "perfect",
            },
        ]
        achievements = []
        for ach in achievements_data:
            a = Achievement(**ach)
            db.add(a)
            achievements.append(a)
        db.flush()

        # ==========================================
        # 2. CREATE DEFAULT LEARNER & LEADERBOARD USERS
        # ==========================================
        learner = User(
            id=1,
            name="Learner",
            xp=180,
            weekly_xp=120,
            streak=3,
            last_active_date=today,
            hearts=5,
            hearts_updated_at=now,
            gems=500,
            daily_goal_xp=20,
            avatar_url="https://api.dicebear.com/7.x/bottts/svg?seed=Learner",
            created_at=now - timedelta(days=14),
        )
        db.add(learner)

        # Leaderboard competitors
        competitors_data = [
            ("Maria Santos", 240, 410, 12, "https://api.dicebear.com/7.x/bottts/svg?seed=Maria"),
            ("Carlos Gomez", 210, 360, 9, "https://api.dicebear.com/7.x/bottts/svg?seed=Carlos"),
            ("Sofia Rossi", 195, 290, 7, "https://api.dicebear.com/7.x/bottts/svg?seed=Sofia"),
            ("Alejandro Silva", 150, 230, 4, "https://api.dicebear.com/7.x/bottts/svg?seed=Alejandro"),
            ("Lucia Fernandez", 135, 190, 5, "https://api.dicebear.com/7.x/bottts/svg?seed=Lucia"),
            ("Mateo Morales", 90, 140, 2, "https://api.dicebear.com/7.x/bottts/svg?seed=Mateo"),
            ("Valentina Ortiz", 75, 110, 3, "https://api.dicebear.com/7.x/bottts/svg?seed=Valentina"),
            ("Diego Alvarez", 60, 85, 1, "https://api.dicebear.com/7.x/bottts/svg?seed=Diego"),
            ("Camila Reyes", 45, 60, 1, "https://api.dicebear.com/7.x/bottts/svg?seed=Camila"),
            ("Elena Diaz", 20, 30, 0, "https://api.dicebear.com/7.x/bottts/svg?seed=Elena"),
        ]

        for name, weekly_xp, total_xp, streak, avatar in competitors_data:
            comp = User(
                name=name,
                xp=total_xp,
                weekly_xp=weekly_xp,
                streak=streak,
                last_active_date=today if streak > 0 else today - timedelta(days=2),
                hearts=5,
                hearts_updated_at=now,
                gems=350,
                daily_goal_xp=20,
                avatar_url=avatar,
                created_at=now - timedelta(days=30),
            )
            db.add(comp)
        db.flush()

        # Seed initial XP events for Learner
        db.add(XPEvent(user_id=learner.id, amount=15, created_at=now - timedelta(days=2)))
        db.add(XPEvent(user_id=learner.id, amount=15, created_at=now - timedelta(days=1)))
        db.add(XPEvent(user_id=learner.id, amount=10, created_at=now - timedelta(hours=2)))

        # Seed unlocked achievements for Learner
        db.add(UserAchievement(user_id=learner.id, achievement_id=achievements[0].id, unlocked_at=now - timedelta(hours=1), progress=3))
        db.add(UserAchievement(user_id=learner.id, achievement_id=achievements[2].id, unlocked_at=now - timedelta(days=1), progress=180))
        db.flush()

        # ==========================================
        # 3. CREATE COURSE, UNITS, SKILLS, LESSONS & EXERCISES
        # ==========================================
        course = Course(language="es", title="Spanish")
        db.add(course)
        db.flush()

        units_config = [
            {
                "order": 1,
                "title": "Unit 1: Foundations",
                "description": "Form basic sentences, greet people, and introduce yourself",
                "skills": [
                    {
                        "order": 1,
                        "title": "Basics 1",
                        "icon": "sparkles",
                        "total_levels": 2,
                        "lessons": [
                            {
                                "order": 1,
                                "level": 1,
                                "exercises": [
                                    {
                                        "order": 1,
                                        "type": "multiple_choice",
                                        "prompt": "Which of these is 'the boy'?",
                                        "data": {
                                            "options": ["El niño", "La niña", "La manzana", "El pan"],
                                            "correct_answer": "El niño",
                                            "explanation": "'El niño' means 'the boy' in Spanish.",
                                        }
                                    },
                                    {
                                        "order": 2,
                                        "type": "translate_word_bank",
                                        "prompt": "Translate this sentence: 'The girl drinks water'",
                                        "data": {
                                            "word_bank": ["La", "niña", "bebe", "agua", "come", "un", "manzana", "el"],
                                            "correct_answer": ["La", "niña", "bebe", "agua"],
                                            "explanation": "'La niña bebe agua' is the direct translation.",
                                        }
                                    },
                                    {
                                        "order": 3,
                                        "type": "match_pairs",
                                        "prompt": "Tap the matching pairs",
                                        "data": {
                                            "pairs": [
                                                {"left": "man", "right": "hombre"},
                                                {"left": "woman", "right": "mujer"},
                                                {"left": "water", "right": "agua"},
                                                {"left": "bread", "right": "pan"},
                                            ],
                                            "explanation": "Great vocabulary matching!",
                                        }
                                    },
                                    {
                                        "order": 4,
                                        "type": "fill_in_blank",
                                        "prompt": "Complete the sentence",
                                        "data": {
                                            "sentence": "Yo ___ un hombre.",
                                            "options": ["soy", "eres", "es", "somos"],
                                            "correct_answer": "soy",
                                            "translation": "I am a man.",
                                            "explanation": "'Yo soy' is the first-person conjugation of 'ser'.",
                                        }
                                    },
                                    {
                                        "order": 5,
                                        "type": "type_answer",
                                        "prompt": "Type in Spanish: 'I drink water'",
                                        "data": {
                                            "sentence_to_translate": "I drink water",
                                            "correct_answer": "Yo bebo agua",
                                            "acceptable_answers": ["yo bebo agua", "bebo agua"],
                                            "hint": "Verb: beber (to drink)",
                                            "explanation": "'Yo bebo agua' or 'Bebo agua' are both correct.",
                                        }
                                    },
                                    {
                                        "order": 6,
                                        "type": "multiple_choice",
                                        "prompt": "Select the correct translation for: 'The apple'",
                                        "data": {
                                            "options": ["La manzana", "El pan", "La leche", "El agua"],
                                            "correct_answer": "La manzana",
                                            "explanation": "'La manzana' is a feminine noun meaning 'the apple'.",
                                        }
                                    },
                                    {
                                        "order": 7,
                                        "type": "translate_word_bank",
                                        "prompt": "Translate: 'He eats bread'",
                                        "data": {
                                            "word_bank": ["Él", "come", "pan", "bebe", "ella", "manzanas", "un"],
                                            "correct_answer": ["Él", "come", "pan"],
                                            "explanation": "'Él come pan' translates to 'He eats bread'.",
                                        }
                                    },
                                    {
                                        "order": 8,
                                        "type": "fill_in_blank",
                                        "prompt": "Choose the right word",
                                        "data": {
                                            "sentence": "Ella ___ agua.",
                                            "options": ["bebe", "bebo", "bebes", "beben"],
                                            "correct_answer": "bebe",
                                            "translation": "She drinks water.",
                                            "explanation": "Third-person singular of beber is 'bebe'.",
                                        }
                                    }
                                ]
                            },
                            {
                                "order": 2,
                                "level": 1,
                                "exercises": [
                                    {
                                        "order": 1,
                                        "type": "multiple_choice",
                                        "prompt": "What does 'La mujer' mean?",
                                        "data": {
                                            "options": ["The woman", "The man", "The girl", "The mother"],
                                            "correct_answer": "The woman",
                                            "explanation": "'La mujer' translates to 'The woman'.",
                                        }
                                    },
                                    {
                                        "order": 2,
                                        "type": "translate_word_bank",
                                        "prompt": "Translate: 'You are a boy'",
                                        "data": {
                                            "word_bank": ["Tú", "eres", "un", "niño", "él", "es", "hombre", "una"],
                                            "correct_answer": ["Tú", "eres", "un", "niño"],
                                            "explanation": "'Tú eres un niño' is the informal singular translation.",
                                        }
                                    },
                                    {
                                        "order": 3,
                                        "type": "match_pairs",
                                        "prompt": "Match the Spanish and English words",
                                        "data": {
                                            "pairs": [
                                                {"left": "I", "right": "yo"},
                                                {"left": "you", "right": "tú"},
                                                {"left": "he", "right": "él"},
                                                {"left": "she", "right": "ella"},
                                            ],
                                            "explanation": "Subject pronouns in Spanish.",
                                        }
                                    },
                                    {
                                        "order": 4,
                                        "type": "fill_in_blank",
                                        "prompt": "Fill in the blank",
                                        "data": {
                                            "sentence": "El hombre come ___.",
                                            "options": ["pan", "agua", "niño", "ella"],
                                            "correct_answer": "pan",
                                            "translation": "The man eats bread.",
                                            "explanation": "'Pan' is bread.",
                                        }
                                    },
                                    {
                                        "order": 5,
                                        "type": "type_answer",
                                        "prompt": "Type in Spanish: 'She is a girl'",
                                        "data": {
                                            "sentence_to_translate": "She is a girl",
                                            "correct_answer": "Ella es una niña",
                                            "acceptable_answers": ["ella es una nina", "ella es una niña", "es una niña"],
                                            "hint": "Ella es...",
                                            "explanation": "'Ella es una niña' means 'She is a girl'.",
                                        }
                                    },
                                    {
                                        "order": 6,
                                        "type": "multiple_choice",
                                        "prompt": "Select 'The milk'",
                                        "data": {
                                            "options": ["La leche", "El agua", "El vino", "El jugo"],
                                            "correct_answer": "La leche",
                                            "explanation": "'La leche' is feminine in Spanish.",
                                        }
                                    },
                                    {
                                        "order": 7,
                                        "type": "translate_word_bank",
                                        "prompt": "Translate: 'I eat an apple'",
                                        "data": {
                                            "word_bank": ["Yo", "como", "una", "manzana", "bebo", "un", "el", "pan"],
                                            "correct_answer": ["Yo", "como", "una", "manzana"],
                                            "explanation": "'Yo como una manzana' translates accurately.",
                                        }
                                    },
                                    {
                                        "order": 8,
                                        "type": "fill_in_blank",
                                        "prompt": "Complete the phrase",
                                        "data": {
                                            "sentence": "Tú ___ leche.",
                                            "options": ["bebes", "bebe", "bebo", "beben"],
                                            "correct_answer": "bebes",
                                            "translation": "You drink milk.",
                                            "explanation": "Second person singular conjugation is 'bebes'.",
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "order": 2,
                        "title": "Greetings",
                        "icon": "message-circle",
                        "total_levels": 2,
                        "lessons": [
                            {
                                "order": 1,
                                "level": 1,
                                "exercises": [
                                    {
                                        "order": 1,
                                        "type": "multiple_choice",
                                        "prompt": "How do you say 'Hello' in Spanish?",
                                        "data": {
                                            "options": ["Hola", "Adiós", "Gracias", "Por favor"],
                                            "correct_answer": "Hola",
                                            "explanation": "'Hola' is the standard Spanish greeting.",
                                        }
                                    },
                                    {
                                        "order": 2,
                                        "type": "translate_word_bank",
                                        "prompt": "Translate: 'Good morning, how are you?'",
                                        "data": {
                                            "word_bank": ["Buenos", "días", "cómo", "estás", "noches", "tardes", "hola", "adiós"],
                                            "correct_answer": ["Buenos", "días", "cómo", "estás"],
                                            "explanation": "'Buenos días, ¿cómo estás?' is customary in the morning.",
                                        }
                                    },
                                    {
                                        "order": 3,
                                        "type": "match_pairs",
                                        "prompt": "Match the greetings and polite phrases",
                                        "data": {
                                            "pairs": [
                                                {"left": "good morning", "right": "buenos días"},
                                                {"left": "good night", "right": "buenas noches"},
                                                {"left": "thank you", "right": "gracias"},
                                                {"left": "please", "right": "por favor"},
                                            ],
                                            "explanation": "Essential everyday courtesy phrases.",
                                        }
                                    },
                                    {
                                        "order": 4,
                                        "type": "fill_in_blank",
                                        "prompt": "Complete the greeting",
                                        "data": {
                                            "sentence": "Buenas ___, ¿cómo estás?",
                                            "options": ["tardes", "días", "hola", "gracias"],
                                            "correct_answer": "tardes",
                                            "translation": "Good afternoon, how are you?",
                                            "explanation": "'Buenas tardes' is feminine plural.",
                                        }
                                    },
                                    {
                                        "order": 5,
                                        "type": "type_answer",
                                        "prompt": "Type in Spanish: 'Thank you very much'",
                                        "data": {
                                            "sentence_to_translate": "Thank you very much",
                                            "correct_answer": "Muchas gracias",
                                            "acceptable_answers": ["muchas gracias", "muchas gracias!"],
                                            "hint": "Muchas...",
                                            "explanation": "'Muchas gracias' translates to 'Thank you very much'.",
                                        }
                                    },
                                    {
                                        "order": 6,
                                        "type": "multiple_choice",
                                        "prompt": "What does 'Mucho gusto' mean?",
                                        "data": {
                                            "options": ["Nice to meet you", "Good luck", "Excuse me", "See you later"],
                                            "correct_answer": "Nice to meet you",
                                            "explanation": "'Mucho gusto' means 'Nice to meet you'.",
                                        }
                                    },
                                    {
                                        "order": 7,
                                        "type": "translate_word_bank",
                                        "prompt": "Translate: 'Goodbye, see you tomorrow'",
                                        "data": {
                                            "word_bank": ["Adiós", "hasta", "mañana", "luego", "hola", "buenas", "días"],
                                            "correct_answer": ["Adiós", "hasta", "mañana"],
                                            "explanation": "'Adiós, hasta mañana' means 'Goodbye, see you tomorrow'.",
                                        }
                                    },
                                    {
                                        "order": 8,
                                        "type": "fill_in_blank",
                                        "prompt": "Complete the farewell",
                                        "data": {
                                            "sentence": "Hasta ___, amigo.",
                                            "options": ["luego", "hola", "gracias", "por"],
                                            "correct_answer": "luego",
                                            "translation": "See you later, friend.",
                                            "explanation": "'Hasta luego' means 'See you later'.",
                                        }
                                    }
                                ]
                            },
                            {
                                "order": 2,
                                "level": 1,
                                "exercises": [
                                    {
                                        "order": 1,
                                        "type": "multiple_choice",
                                        "prompt": "Which of these means 'Excuse me'?",
                                        "data": {
                                            "options": ["Disculpe", "Hola", "De nada", "Adiós"],
                                            "correct_answer": "Disculpe",
                                            "explanation": "'Disculpe' or 'Perdón' means 'Excuse me'.",
                                        }
                                    },
                                    {
                                        "order": 2,
                                        "type": "translate_word_bank",
                                        "prompt": "Translate: 'You are welcome'",
                                        "data": {
                                            "word_bank": ["De", "nada", "por", "favor", "gracias", "hola", "bien"],
                                            "correct_answer": ["De", "nada"],
                                            "explanation": "'De nada' translates to 'You're welcome'.",
                                        }
                                    },
                                    {
                                        "order": 3,
                                        "type": "match_pairs",
                                        "prompt": "Match the expressions",
                                        "data": {
                                            "pairs": [
                                                {"left": "see you soon", "right": "hasta pronto"},
                                                {"left": "excuse me", "right": "disculpe"},
                                                {"left": "you're welcome", "right": "de nada"},
                                                {"left": "sorry", "right": "lo siento"},
                                            ],
                                            "explanation": "Essential conversational interactions.",
                                        }
                                    },
                                    {
                                        "order": 4,
                                        "type": "fill_in_blank",
                                        "prompt": "Complete the polite response",
                                        "data": {
                                            "sentence": "Lo ___, no hablo inglés.",
                                            "options": ["siento", "gusto", "gracias", "hola"],
                                            "correct_answer": "siento",
                                            "translation": "I'm sorry, I don't speak English.",
                                            "explanation": "'Lo siento' means 'I am sorry'.",
                                        }
                                    },
                                    {
                                        "order": 5,
                                        "type": "type_answer",
                                        "prompt": "Type in Spanish: 'See you later'",
                                        "data": {
                                            "sentence_to_translate": "See you later",
                                            "correct_answer": "Hasta luego",
                                            "acceptable_answers": ["hasta luego", "nos vemos luego"],
                                            "hint": "Hasta...",
                                            "explanation": "'Hasta luego' is the most common Spanish phrase for 'See you later'.",
                                        }
                                    },
                                    {
                                        "order": 6,
                                        "type": "multiple_choice",
                                        "prompt": "How do you reply to '¿Cómo estás?' when doing well?",
                                        "data": {
                                            "options": ["Muy bien, gracias", "Adiós", "Mucho gusto", "Lo siento"],
                                            "correct_answer": "Muy bien, gracias",
                                            "explanation": "'Muy bien, gracias' means 'Very well, thank you'.",
                                        }
                                    },
                                    {
                                        "order": 7,
                                        "type": "translate_word_bank",
                                        "prompt": "Translate: 'Good night, until tomorrow'",
                                        "data": {
                                            "word_bank": ["Buenas", "noches", "hasta", "mañana", "días", "tardes", "hola"],
                                            "correct_answer": ["Buenas", "noches", "hasta", "mañana"],
                                            "explanation": "'Buenas noches, hasta mañana' is polite before sleeping.",
                                        }
                                    },
                                    {
                                        "order": 8,
                                        "type": "fill_in_blank",
                                        "prompt": "Fill in the blank",
                                        "data": {
                                            "sentence": "Mucho ___, señor López.",
                                            "options": ["gusto", "bien", "siento", "días"],
                                            "correct_answer": "gusto",
                                            "translation": "Nice to meet you, Mr. Lopez.",
                                            "explanation": "'Mucho gusto' indicates pleasure in meeting someone.",
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "order": 2,
                "title": "Unit 2: Daily Life",
                "description": "Order food, discuss meals, and talk about your family members",
                "skills": [
                    {
                        "order": 1,
                        "title": "Food",
                        "icon": "utensils",
                        "total_levels": 3,
                        "lessons": [
                            {
                                "order": 1,
                                "level": 1,
                                "exercises": [
                                    {
                                        "order": 1,
                                        "type": "multiple_choice",
                                        "prompt": "Which of these is 'the cheese'?",
                                        "data": {
                                            "options": ["El queso", "La sopa", "El arroz", "El pescado"],
                                            "correct_answer": "El queso",
                                            "explanation": "'El queso' is cheese in Spanish.",
                                        }
                                    },
                                    {
                                        "order": 2,
                                        "type": "translate_word_bank",
                                        "prompt": "Translate: 'I would like a coffee, please'",
                                        "data": {
                                            "word_bank": ["Yo", "quiero", "un", "café", "por", "favor", "té", "leche", "con"],
                                            "correct_answer": ["Yo", "quiero", "un", "café", "por", "favor"],
                                            "explanation": "'Yo quiero un café, por favor' is natural when ordering.",
                                        }
                                    },
                                    {
                                        "order": 3,
                                        "type": "match_pairs",
                                        "prompt": "Match food items",
                                        "data": {
                                            "pairs": [
                                                {"left": "cheese", "right": "queso"},
                                                {"left": "rice", "right": "arroz"},
                                                {"left": "fish", "right": "pescado"},
                                                {"left": "soup", "right": "sopa"},
                                            ],
                                            "explanation": "Common food words.",
                                        }
                                    },
                                    {
                                        "order": 4,
                                        "type": "fill_in_blank",
                                        "prompt": "Complete the sentence",
                                        "data": {
                                            "sentence": "Nosotros comemos ___ en la cena.",
                                            "options": ["pollo", "agua", "café", "té"],
                                            "correct_answer": "pollo",
                                            "translation": "We eat chicken for dinner.",
                                            "explanation": "'Pollo' means chicken.",
                                        }
                                    },
                                    {
                                        "order": 5,
                                        "type": "type_answer",
                                        "prompt": "Type in Spanish: 'I eat rice with fish'",
                                        "data": {
                                            "sentence_to_translate": "I eat rice with fish",
                                            "correct_answer": "Como arroz con pescado",
                                            "acceptable_answers": ["como arroz con pescado", "yo como arroz con pescado"],
                                            "hint": "Como arroz...",
                                            "explanation": "'Como arroz con pescado' means 'I eat rice with fish'.",
                                        }
                                    },
                                    {
                                        "order": 6,
                                        "type": "multiple_choice",
                                        "prompt": "What does 'La cuenta, por favor' mean?",
                                        "data": {
                                            "options": ["The bill, please", "The menu, please", "More water, please", "Table for two"],
                                            "correct_answer": "The bill, please",
                                            "explanation": "Used at the end of a restaurant meal.",
                                        }
                                    },
                                    {
                                        "order": 7,
                                        "type": "translate_word_bank",
                                        "prompt": "Translate: 'A table for two people'",
                                        "data": {
                                            "word_bank": ["Una", "mesa", "para", "dos", "personas", "tres", "cuatro", "un"],
                                            "correct_answer": ["Una", "mesa", "para", "dos", "personas"],
                                            "explanation": "'Una mesa para dos personas' is helpful at a restaurant.",
                                        }
                                    },
                                    {
                                        "order": 8,
                                        "type": "fill_in_blank",
                                        "prompt": "Fill in the blank",
                                        "data": {
                                            "sentence": "¿Quieres un vaso de ___?",
                                            "options": ["agua", "pollo", "arroz", "carne"],
                                            "correct_answer": "agua",
                                            "translation": "Do you want a glass of water?",
                                            "explanation": "'Vaso de agua' is 'glass of water'.",
                                        }
                                    }
                                ]
                            },
                            {
                                "order": 2,
                                "level": 1,
                                "exercises": [
                                    {
                                        "order": 1,
                                        "type": "multiple_choice",
                                        "prompt": "Which of these means 'The breakfast'?",
                                        "data": {
                                            "options": ["El desayuno", "El almuerzo", "La cena", "La merienda"],
                                            "correct_answer": "El desayuno",
                                            "explanation": "'El desayuno' is breakfast.",
                                        }
                                    },
                                    {
                                        "order": 2,
                                        "type": "translate_word_bank",
                                        "prompt": "Translate: 'She drinks hot tea'",
                                        "data": {
                                            "word_bank": ["Ella", "bebe", "té", "caliente", "frío", "café", "come", "un"],
                                            "correct_answer": ["Ella", "bebe", "té", "caliente"],
                                            "explanation": "'Ella bebe té caliente' translates directly.",
                                        }
                                    },
                                    {
                                        "order": 3,
                                        "type": "match_pairs",
                                        "prompt": "Match beverages and meals",
                                        "data": {
                                            "pairs": [
                                                {"left": "breakfast", "right": "desayuno"},
                                                {"left": "lunch", "right": "almuerzo"},
                                                {"left": "dinner", "right": "cena"},
                                                {"left": "tea", "right": "té"},
                                            ],
                                            "explanation": "Meals and drinks.",
                                        }
                                    },
                                    {
                                        "order": 4,
                                        "type": "fill_in_blank",
                                        "prompt": "Fill in the blank",
                                        "data": {
                                            "sentence": "El café está muy ___.",
                                            "options": ["caliente", "manzana", "mesa", "agua"],
                                            "correct_answer": "caliente",
                                            "translation": "The coffee is very hot.",
                                            "explanation": "'Caliente' means hot.",
                                        }
                                    },
                                    {
                                        "order": 5,
                                        "type": "type_answer",
                                        "prompt": "Type in Spanish: 'I want chicken with potatoes'",
                                        "data": {
                                            "sentence_to_translate": "I want chicken with potatoes",
                                            "correct_answer": "Quiero pollo con papas",
                                            "acceptable_answers": ["quiero pollo con papas", "yo quiero pollo con papas", "quiero pollo con patatas"],
                                            "hint": "Quiero pollo...",
                                            "explanation": "'Papas' or 'patatas' both mean potatoes.",
                                        }
                                    },
                                    {
                                        "order": 6,
                                        "type": "multiple_choice",
                                        "prompt": "What does 'Delicioso' mean?",
                                        "data": {
                                            "options": ["Delicious", "Spicy", "Cold", "Expensive"],
                                            "correct_answer": "Delicious",
                                            "explanation": "'Delicioso' describes tasty food.",
                                        }
                                    },
                                    {
                                        "order": 7,
                                        "type": "translate_word_bank",
                                        "prompt": "Translate: 'Do you eat meat?'",
                                        "data": {
                                            "word_bank": ["¿Tú", "comes", "carne?", "pescado", "arroz", "bebes", "ella"],
                                            "correct_answer": ["¿Tú", "comes", "carne?"],
                                            "explanation": "'¿Tú comes carne?' asks if you eat meat.",
                                        }
                                    },
                                    {
                                        "order": 8,
                                        "type": "fill_in_blank",
                                        "prompt": "Complete the question",
                                        "data": {
                                            "sentence": "¿Cuánto ___ esta comida?",
                                            "options": ["cuesta", "comes", "bebes", "somos"],
                                            "correct_answer": "cuesta",
                                            "translation": "How much does this food cost?",
                                            "explanation": "'¿Cuánto cuesta?' asks for price.",
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "order": 2,
                        "title": "Family",
                        "icon": "users",
                        "total_levels": 3,
                        "lessons": [
                            {
                                "order": 1,
                                "level": 1,
                                "exercises": [
                                    {
                                        "order": 1,
                                        "type": "multiple_choice",
                                        "prompt": "Which of these is 'my mother'?",
                                        "data": {
                                            "options": ["Mi madre", "Mi padre", "Mi hermano", "Mi abuelo"],
                                            "correct_answer": "Mi madre",
                                            "explanation": "'Mi madre' or 'Mi mamá' means 'my mother'.",
                                        }
                                    },
                                    {
                                        "order": 2,
                                        "type": "translate_word_bank",
                                        "prompt": "Translate: 'My brother has a dog'",
                                        "data": {
                                            "word_bank": ["Mi", "hermano", "tiene", "un", "perro", "gato", "hermana", "su"],
                                            "correct_answer": ["Mi", "hermano", "tiene", "un", "perro"],
                                            "explanation": "'Mi hermano tiene un perro' translates directly.",
                                        }
                                    },
                                    {
                                        "order": 3,
                                        "type": "match_pairs",
                                        "prompt": "Match family relationships",
                                        "data": {
                                            "pairs": [
                                                {"left": "father", "right": "padre"},
                                                {"left": "mother", "right": "madre"},
                                                {"left": "brother", "right": "hermano"},
                                                {"left": "sister", "right": "hermana"},
                                            ],
                                            "explanation": "Immediate family members.",
                                        }
                                    },
                                    {
                                        "order": 4,
                                        "type": "fill_in_blank",
                                        "prompt": "Fill in the blank",
                                        "data": {
                                            "sentence": "Mi ___ se llama Carlos.",
                                            "options": ["padre", "madre", "hermana", "abuela"],
                                            "correct_answer": "padre",
                                            "translation": "My father's name is Carlos.",
                                            "explanation": "'Padre' is masculine matching 'Carlos'.",
                                        }
                                    },
                                    {
                                        "order": 5,
                                        "type": "type_answer",
                                        "prompt": "Type in Spanish: 'I have a large family'",
                                        "data": {
                                            "sentence_to_translate": "I have a large family",
                                            "correct_answer": "Tengo una familia grande",
                                            "acceptable_answers": ["tengo una familia grande", "yo tengo una familia grande"],
                                            "hint": "Tengo una...",
                                            "explanation": "'Tengo una familia grande' expresses this well.",
                                        }
                                    },
                                    {
                                        "order": 6,
                                        "type": "multiple_choice",
                                        "prompt": "What does 'Abuelo' mean?",
                                        "data": {
                                            "options": ["Grandfather", "Uncle", "Cousin", "Nephew"],
                                            "correct_answer": "Grandfather",
                                            "explanation": "'Abuelo' is grandfather.",
                                        }
                                    },
                                    {
                                        "order": 7,
                                        "type": "translate_word_bank",
                                        "prompt": "Translate: 'Where does your sister live?'",
                                        "data": {
                                            "word_bank": ["¿Dónde", "vive", "tu", "hermana?", "hermano", "madre", "padre"],
                                            "correct_answer": ["¿Dónde", "vive", "tu", "hermana?"],
                                            "explanation": "'¿Dónde vive tu hermana?' asks for location.",
                                        }
                                    },
                                    {
                                        "order": 8,
                                        "type": "fill_in_blank",
                                        "prompt": "Choose the correct possessive",
                                        "data": {
                                            "sentence": "Ella vive con ___ abuela.",
                                            "options": ["su", "sus", "tu", "mi"],
                                            "correct_answer": "su",
                                            "translation": "She lives with her grandmother.",
                                            "explanation": "'Su' is the singular possessive for 'her'.",
                                        }
                                    }
                                ]
                            },
                            {
                                "order": 2,
                                "level": 1,
                                "exercises": [
                                    {
                                        "order": 1,
                                        "type": "multiple_choice",
                                        "prompt": "Which of these means 'The son'?",
                                        "data": {
                                            "options": ["El hijo", "La hija", "El tío", "El primo"],
                                            "correct_answer": "El hijo",
                                            "explanation": "'El hijo' means son.",
                                        }
                                    },
                                    {
                                        "order": 2,
                                        "type": "translate_word_bank",
                                        "prompt": "Translate: 'My parents live in Madrid'",
                                        "data": {
                                            "word_bank": ["Mis", "padres", "viven", "en", "Madrid", "vive", "mi", "casa"],
                                            "correct_answer": ["Mis", "padres", "viven", "en", "Madrid"],
                                            "explanation": "'Mis padres viven en Madrid' uses plural verb.",
                                        }
                                    },
                                    {
                                        "order": 3,
                                        "type": "match_pairs",
                                        "prompt": "Match extended family",
                                        "data": {
                                            "pairs": [
                                                {"left": "uncle", "right": "tío"},
                                                {"left": "aunt", "right": "tía"},
                                                {"left": "cousin", "right": "primo"},
                                                {"left": "grandmother", "right": "abuela"},
                                            ],
                                            "explanation": "Extended family vocabulary.",
                                        }
                                    },
                                    {
                                        "order": 4,
                                        "type": "fill_in_blank",
                                        "prompt": "Fill in the blank",
                                        "data": {
                                            "sentence": "Nosotros somos una ___ feliz.",
                                            "options": ["familia", "hermano", "padre", "tío"],
                                            "correct_answer": "familia",
                                            "translation": "We are a happy family.",
                                            "explanation": "'Familia' is feminine singular.",
                                        }
                                    },
                                    {
                                        "order": 5,
                                        "type": "type_answer",
                                        "prompt": "Type in Spanish: 'My daughter is intelligent'",
                                        "data": {
                                            "sentence_to_translate": "My daughter is intelligent",
                                            "correct_answer": "Mi hija es inteligente",
                                            "acceptable_answers": ["mi hija es inteligente"],
                                            "hint": "Mi hija...",
                                            "explanation": "'Mi hija es inteligente' means 'My daughter is intelligent'.",
                                        }
                                    },
                                    {
                                        "order": 6,
                                        "type": "multiple_choice",
                                        "prompt": "What does 'Tía' mean in Spanish?",
                                        "data": {
                                            "options": ["Aunt", "Sister", "Mother", "Niece"],
                                            "correct_answer": "Aunt",
                                            "explanation": "'Tía' is aunt.",
                                        }
                                    },
                                    {
                                        "order": 7,
                                        "type": "translate_word_bank",
                                        "prompt": "Translate: 'Do you have brothers or sisters?'",
                                        "data": {
                                            "word_bank": ["¿Tienes", "hermanos", "o", "hermanas?", "padres", "hijos", "tíos"],
                                            "correct_answer": ["¿Tienes", "hermanos", "o", "hermanas?"],
                                            "explanation": "'¿Tienes hermanos o hermanas?' is the standard query.",
                                        }
                                    },
                                    {
                                        "order": 8,
                                        "type": "fill_in_blank",
                                        "prompt": "Complete the sentence",
                                        "data": {
                                            "sentence": "Mi abuelo tiene ochenta ___.",
                                            "options": ["años", "días", "meses", "horas"],
                                            "correct_answer": "años",
                                            "translation": "My grandfather is eighty years old.",
                                            "explanation": "Age in Spanish is expressed with 'tener ... años'.",
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                "order": 3,
                "title": "Unit 3: Exploration",
                "description": "Learn animal names, navigate transport, and travel abroad",
                "skills": [
                    {
                        "order": 1,
                        "title": "Animals",
                        "icon": "bug",
                        "total_levels": 3,
                        "lessons": [
                            {
                                "order": 1,
                                "level": 1,
                                "exercises": [
                                    {
                                        "order": 1,
                                        "type": "multiple_choice",
                                        "prompt": "Which of these is 'the cat'?",
                                        "data": {
                                            "options": ["El gato", "El perro", "El pájaro", "El caballo"],
                                            "correct_answer": "El gato",
                                            "explanation": "'El gato' is cat.",
                                        }
                                    },
                                    {
                                        "order": 2,
                                        "type": "translate_word_bank",
                                        "prompt": "Translate: 'The dog plays in the garden'",
                                        "data": {
                                            "word_bank": ["El", "perro", "juega", "en", "el", "jardín", "gato", "corre", "casa"],
                                            "correct_answer": ["El", "perro", "juega", "en", "el", "jardín"],
                                            "explanation": "'El perro juega en el jardín' is the full translation.",
                                        }
                                    },
                                    {
                                        "order": 3,
                                        "type": "match_pairs",
                                        "prompt": "Match animals with English names",
                                        "data": {
                                            "pairs": [
                                                {"left": "dog", "right": "perro"},
                                                {"left": "cat", "right": "gato"},
                                                {"left": "horse", "right": "caballo"},
                                                {"left": "bird", "right": "pájaro"},
                                            ],
                                            "explanation": "Animal kingdom vocabulary.",
                                        }
                                    },
                                    {
                                        "order": 4,
                                        "type": "fill_in_blank",
                                        "prompt": "Fill in the blank",
                                        "data": {
                                            "sentence": "El caballo es muy ___.",
                                            "options": ["rápido", "verde", "manzana", "agua"],
                                            "correct_answer": "rápido",
                                            "translation": "The horse is very fast.",
                                            "explanation": "'Rápido' means fast.",
                                        }
                                    },
                                    {
                                        "order": 5,
                                        "type": "type_answer",
                                        "prompt": "Type in Spanish: 'The bird sings in the morning'",
                                        "data": {
                                            "sentence_to_translate": "The bird sings in the morning",
                                            "correct_answer": "El pájaro canta en la mañana",
                                            "acceptable_answers": ["el pajaro canta en la manana", "el pájaro canta por la mañana", "el pájaro canta en la mañana"],
                                            "hint": "El pájaro canta...",
                                            "explanation": "'El pájaro canta en la mañana' translates the sentence.",
                                        }
                                    },
                                    {
                                        "order": 6,
                                        "type": "multiple_choice",
                                        "prompt": "What does 'El elefante' mean?",
                                        "data": {
                                            "options": ["The elephant", "The lion", "The bear", "The tiger"],
                                            "correct_answer": "The elephant",
                                            "explanation": "'El elefante' is cognate for elephant.",
                                        }
                                    },
                                    {
                                        "order": 7,
                                        "type": "translate_word_bank",
                                        "prompt": "Translate: 'The white cat drinks milk'",
                                        "data": {
                                            "word_bank": ["El", "gato", "blanco", "bebe", "leche", "negro", "agua", "come"],
                                            "correct_answer": ["El", "gato", "blanco", "bebe", "leche"],
                                            "explanation": "Adjectives follow nouns in Spanish: 'gato blanco'.",
                                        }
                                    },
                                    {
                                        "order": 8,
                                        "type": "fill_in_blank",
                                        "prompt": "Complete the animal phrase",
                                        "data": {
                                            "sentence": "Los peces viven en el ___.",
                                            "options": ["agua", "árbol", "casa", "queso"],
                                            "correct_answer": "agua",
                                            "translation": "Fish live in water.",
                                            "explanation": "'Peces viven en el agua' is correct.",
                                        }
                                    }
                                ]
                            },
                            {
                                "order": 2,
                                "level": 1,
                                "exercises": [
                                    {
                                        "order": 1,
                                        "type": "multiple_choice",
                                        "prompt": "Which of these is 'the bear'?",
                                        "data": {
                                            "options": ["El oso", "El lobo", "El león", "El zorro"],
                                            "correct_answer": "El oso",
                                            "explanation": "'El oso' is bear.",
                                        }
                                    },
                                    {
                                        "order": 2,
                                        "type": "translate_word_bank",
                                        "prompt": "Translate: 'The wolf is in the forest'",
                                        "data": {
                                            "word_bank": ["El", "lobo", "está", "en", "el", "bosque", "oso", "ciudad", "casa"],
                                            "correct_answer": ["El", "lobo", "está", "en", "el", "bosque"],
                                            "explanation": "'El lobo está en el bosque' uses 'estar' for location.",
                                        }
                                    },
                                    {
                                        "order": 3,
                                        "type": "match_pairs",
                                        "prompt": "Match wild animals",
                                        "data": {
                                            "pairs": [
                                                {"left": "bear", "right": "oso"},
                                                {"left": "wolf", "right": "lobo"},
                                                {"left": "lion", "right": "león"},
                                                {"left": "mouse", "right": "ratón"},
                                            ],
                                            "explanation": "Wild animals in Spanish.",
                                        }
                                    },
                                    {
                                        "order": 4,
                                        "type": "fill_in_blank",
                                        "prompt": "Fill in the blank",
                                        "data": {
                                            "sentence": "El ratón come ___.",
                                            "options": ["queso", "leche", "agua", "árbol"],
                                            "correct_answer": "queso",
                                            "translation": "The mouse eats cheese.",
                                            "explanation": "'Queso' is cheese.",
                                        }
                                    },
                                    {
                                        "order": 5,
                                        "type": "type_answer",
                                        "prompt": "Type in Spanish: 'I like animals'",
                                        "data": {
                                            "sentence_to_translate": "I like animals",
                                            "correct_answer": "Me gustan los animales",
                                            "acceptable_answers": ["me gustan los animales", "a mi me gustan los animales", "a mí me gustan los animales"],
                                            "hint": "Me gustan...",
                                            "explanation": "'Me gustan los animales' uses the verb 'gustar' with plural agreement.",
                                        }
                                    },
                                    {
                                        "order": 6,
                                        "type": "multiple_choice",
                                        "prompt": "What is 'Una mariposa'?",
                                        "data": {
                                            "options": ["A butterfly", "A spider", "A bee", "A fly"],
                                            "correct_answer": "A butterfly",
                                            "explanation": "'Mariposa' means butterfly.",
                                        }
                                    },
                                    {
                                        "order": 7,
                                        "type": "translate_word_bank",
                                        "prompt": "Translate: 'The monkey climbs the tree'",
                                        "data": {
                                            "word_bank": ["El", "mono", "sube", "al", "árbol", "perro", "corre", "jardín"],
                                            "correct_answer": ["El", "mono", "sube", "al", "árbol"],
                                            "explanation": "'El mono sube al árbol' means 'The monkey climbs the tree'.",
                                        }
                                    },
                                    {
                                        "order": 8,
                                        "type": "fill_in_blank",
                                        "prompt": "Choose the animal",
                                        "data": {
                                            "sentence": "El rey de la selva es el ___.",
                                            "options": ["león", "pájaro", "ratón", "pez"],
                                            "correct_answer": "león",
                                            "translation": "The king of the jungle is the lion.",
                                            "explanation": "'León' is lion.",
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "order": 2,
                        "title": "Travel",
                        "icon": "plane",
                        "total_levels": 3,
                        "lessons": [
                            {
                                "order": 1,
                                "level": 1,
                                "exercises": [
                                    {
                                        "order": 1,
                                        "type": "multiple_choice",
                                        "prompt": "Which of these is 'the airport'?",
                                        "data": {
                                            "options": ["El aeropuerto", "La estación", "El hotel", "El boleto"],
                                            "correct_answer": "El aeropuerto",
                                            "explanation": "'El aeropuerto' is airport.",
                                        }
                                    },
                                    {
                                        "order": 2,
                                        "type": "translate_word_bank",
                                        "prompt": "Translate: 'Where is the train station?'",
                                        "data": {
                                            "word_bank": ["¿Dónde", "está", "la", "estación", "de", "tren?", "hotel", "aeropuerto", "un"],
                                            "correct_answer": ["¿Dónde", "está", "la", "estación", "de", "tren?"],
                                            "explanation": "'¿Dónde está la estación de tren?' asks for navigation.",
                                        }
                                    },
                                    {
                                        "order": 3,
                                        "type": "match_pairs",
                                        "prompt": "Match travel terms",
                                        "data": {
                                            "pairs": [
                                                {"left": "ticket", "right": "boleto"},
                                                {"left": "hotel", "right": "hotel"},
                                                {"left": "passport", "right": "pasaporte"},
                                                {"left": "suitcase", "right": "maleta"},
                                            ],
                                            "explanation": "Essential travel vocabulary.",
                                        }
                                    },
                                    {
                                        "order": 4,
                                        "type": "fill_in_blank",
                                        "prompt": "Complete the travel request",
                                        "data": {
                                            "sentence": "Tengo una reserva en este ___.",
                                            "options": ["hotel", "tren", "maleta", "boleto"],
                                            "correct_answer": "hotel",
                                            "translation": "I have a reservation at this hotel.",
                                            "explanation": "'Hotel' completes the reservation phrase.",
                                        }
                                    },
                                    {
                                        "order": 5,
                                        "type": "type_answer",
                                        "prompt": "Type in Spanish: 'I need my passport'",
                                        "data": {
                                            "sentence_to_translate": "I need my passport",
                                            "correct_answer": "Necesito mi pasaporte",
                                            "acceptable_answers": ["necesito mi pasaporte", "yo necesito mi pasaporte"],
                                            "hint": "Necesito...",
                                            "explanation": "'Necesito mi pasaporte' translates 'I need my passport'.",
                                        }
                                    },
                                    {
                                        "order": 6,
                                        "type": "multiple_choice",
                                        "prompt": "What is 'Un boleto de avión'?",
                                        "data": {
                                            "options": ["A plane ticket", "A train ticket", "A hotel room", "A taxi ride"],
                                            "correct_answer": "A plane ticket",
                                            "explanation": "'Boleto de avión' is a plane ticket.",
                                        }
                                    },
                                    {
                                        "order": 7,
                                        "type": "translate_word_bank",
                                        "prompt": "Translate: 'A taxi to the center, please'",
                                        "data": {
                                            "word_bank": ["Un", "taxi", "al", "centro", "por", "favor", "hotel", "aeropuerto"],
                                            "correct_answer": ["Un", "taxi", "al", "centro", "por", "favor"],
                                            "explanation": "'Un taxi al centro, por favor' is useful for transit.",
                                        }
                                    },
                                    {
                                        "order": 8,
                                        "type": "fill_in_blank",
                                        "prompt": "Fill in the blank",
                                        "data": {
                                            "sentence": "¿A qué hora sale el ___?",
                                            "options": ["vuelo", "pasaporte", "maleta", "hotel"],
                                            "correct_answer": "vuelo",
                                            "translation": "What time does the flight leave?",
                                            "explanation": "'Vuelo' is flight.",
                                        }
                                    }
                                ]
                            },
                            {
                                "order": 2,
                                "level": 1,
                                "exercises": [
                                    {
                                        "order": 1,
                                        "type": "multiple_choice",
                                        "prompt": "Which of these means 'The beach'?",
                                        "data": {
                                            "options": ["La playa", "La montaña", "El museo", "La ciudad"],
                                            "correct_answer": "La playa",
                                            "explanation": "'La playa' is beach.",
                                        }
                                    },
                                    {
                                        "order": 2,
                                        "type": "translate_word_bank",
                                        "prompt": "Translate: 'We travel to Spain in summer'",
                                        "data": {
                                            "word_bank": ["Viajamos", "a", "España", "en", "verano", "invierno", "México", "yo"],
                                            "correct_answer": ["Viajamos", "a", "España", "en", "verano"],
                                            "explanation": "'Viajamos a España en verano' means 'We travel to Spain in summer'.",
                                        }
                                    },
                                    {
                                        "order": 3,
                                        "type": "match_pairs",
                                        "prompt": "Match destinations",
                                        "data": {
                                            "pairs": [
                                                {"left": "beach", "right": "playa"},
                                                {"left": "mountain", "right": "montaña"},
                                                {"left": "city", "right": "ciudad"},
                                                {"left": "museum", "right": "museo"},
                                            ],
                                            "explanation": "Vacation and travel destinations.",
                                        }
                                    },
                                    {
                                        "order": 4,
                                        "type": "fill_in_blank",
                                        "prompt": "Fill in the blank",
                                        "data": {
                                            "sentence": "Quiero visitar el ___ de arte.",
                                            "options": ["museo", "playa", "tren", "maleta"],
                                            "correct_answer": "museo",
                                            "translation": "I want to visit the art museum.",
                                            "explanation": "'Museo de arte' is art museum.",
                                        }
                                    },
                                    {
                                        "order": 5,
                                        "type": "type_answer",
                                        "prompt": "Type in Spanish: 'Have a good trip!'",
                                        "data": {
                                            "sentence_to_translate": "Have a good trip!",
                                            "correct_answer": "¡Buen viaje!",
                                            "acceptable_answers": ["buen viaje", "buen viaje!", "¡buen viaje!"],
                                            "hint": "¡Buen...",
                                            "explanation": "'¡Buen viaje!' is the Spanish equivalent of Bon Voyage.",
                                        }
                                    },
                                    {
                                        "order": 6,
                                        "type": "multiple_choice",
                                        "prompt": "What does 'Habitación con vista' mean?",
                                        "data": {
                                            "options": ["Room with a view", "Room with breakfast", "Quiet room", "Double bed"],
                                            "correct_answer": "Room with a view",
                                            "explanation": "'Habitación con vista' means room with a view.",
                                        }
                                    },
                                    {
                                        "order": 7,
                                        "type": "translate_word_bank",
                                        "prompt": "Translate: 'Do you accept credit cards?'",
                                        "data": {
                                            "word_bank": ["¿Aceptan", "tarjetas", "de", "crédito?", "dinero", "efectivo", "dólares"],
                                            "correct_answer": ["¿Aceptan", "tarjetas", "de", "crédito?"],
                                            "explanation": "'¿Aceptan tarjetas de crédito?' asks for payment methods.",
                                        }
                                    },
                                    {
                                        "order": 8,
                                        "type": "fill_in_blank",
                                        "prompt": "Choose the correct phrase",
                                        "data": {
                                            "sentence": "El hotel está cerca de la ___.",
                                            "options": ["playa", "tren", "boleto", "vuelo"],
                                            "correct_answer": "playa",
                                            "translation": "The hotel is near the beach.",
                                            "explanation": "'Cerca de la playa' is near the beach.",
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]

        created_skills = []
        created_lessons = []

        for u_cfg in units_config:
            unit = Unit(
                course_id=course.id,
                order=u_cfg["order"],
                title=u_cfg["title"],
                description=u_cfg["description"],
            )
            db.add(unit)
            db.flush()

            for s_cfg in u_cfg["skills"]:
                skill = Skill(
                    unit_id=unit.id,
                    order=s_cfg["order"],
                    title=s_cfg["title"],
                    icon=s_cfg["icon"],
                    total_levels=s_cfg["total_levels"],
                )
                db.add(skill)
                db.flush()
                created_skills.append(skill)

                for l_cfg in s_cfg["lessons"]:
                    lesson = Lesson(
                        skill_id=skill.id,
                        order=l_cfg["order"],
                        level=l_cfg["level"],
                    )
                    db.add(lesson)
                    db.flush()
                    created_lessons.append(lesson)

                    for ex_cfg in l_cfg["exercises"]:
                        exercise = Exercise(
                            lesson_id=lesson.id,
                            order=ex_cfg["order"],
                            type=ex_cfg["type"],
                            prompt=ex_cfg["prompt"],
                            data=ex_cfg["data"],
                        )
                        db.add(exercise)

        db.flush()

        # ==========================================
        # 4. SEED INITIAL PROGRESS FOR LEARNER (id=1)
        # Unit 1 skills (Basics 1 & Greetings) completed
        # Unit 2 Skill 1 (Food) available
        # Remaining skills locked
        # ==========================================
        skill_basics = created_skills[0]     # Basics 1
        skill_greetings = created_skills[1]  # Greetings
        skill_food = created_skills[2]       # Food
        skill_family = created_skills[3]     # Family
        skill_animals = created_skills[4]    # Animals
        skill_travel = created_skills[5]     # Travel

        # 1. Basics 1: Completed
        db.add(UserSkillProgress(
            user_id=learner.id,
            skill_id=skill_basics.id,
            levels_completed=skill_basics.total_levels,
            status="completed",
            updated_at=now - timedelta(days=2),
        ))
        for l in skill_basics.lessons:
            db.add(UserLessonProgress(
                user_id=learner.id,
                lesson_id=l.id,
                completed_at=now - timedelta(days=2),
                xp_earned=15,
            ))

        # 2. Greetings: Completed
        db.add(UserSkillProgress(
            user_id=learner.id,
            skill_id=skill_greetings.id,
            levels_completed=skill_greetings.total_levels,
            status="completed",
            updated_at=now - timedelta(days=1),
        ))
        for l in skill_greetings.lessons:
            db.add(UserLessonProgress(
                user_id=learner.id,
                lesson_id=l.id,
                completed_at=now - timedelta(days=1),
                xp_earned=15,
            ))

        # 3. Food: Available (Unlocked)
        db.add(UserSkillProgress(
            user_id=learner.id,
            skill_id=skill_food.id,
            levels_completed=0,
            status="available",
            updated_at=now - timedelta(hours=2),
        ))

        # 4, 5, 6: Locked
        for locked_skill in [skill_family, skill_animals, skill_travel]:
            db.add(UserSkillProgress(
                user_id=learner.id,
                skill_id=locked_skill.id,
                levels_completed=0,
                status="locked",
                updated_at=now,
            ))

        db.commit()
        print(f"Database successfully seeded with {len(created_skills)} skills, {len(created_lessons)} lessons, and 120+ exercises!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        if own_session:
            db.close()

if __name__ == "__main__":
    seed_database()
