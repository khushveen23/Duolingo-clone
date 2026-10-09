# Duolingo Clone — Backend API (FastAPI)

This is the backend service for the Duolingo clone full-stack web application. It is built with **FastAPI**, **SQLAlchemy 2.x**, **SQLite**, and **Pydantic v2**.

---

## 📁 Architecture & Folder Structure

```text
backend/
├── app/
│   ├── config.py             # Settings, environment variables, CORS origins
│   ├── database.py           # SQLite connection engine & session factory
│   ├── main.py               # FastAPI application entrypoint & startup auto-seed
│   ├── models/               # SQLAlchemy ORM models with relational FKs
│   │   ├── user.py           # User model (XP, streak, hearts, gems, goals)
│   │   ├── course.py         # Course model (language, title)
│   │   ├── unit.py           # Unit model (milestones/chapters)
│   │   ├── skill.py          # Skill model (tree nodes, levels)
│   │   ├── lesson.py         # Lesson model
│   │   ├── exercise.py       # Exercise model (5 distinct exercise types)
│   │   ├── progress.py       # UserSkillProgress & UserLessonProgress
│   │   ├── xp_event.py       # Granular XP event log for streaks & daily goals
│   │   └── achievement.py    # Achievements & user unlocks
│   ├── schemas/              # Pydantic validation models for requests & responses
│   ├── routers/              # Clean API routes (thin controllers)
│   │   ├── me.py             # GET /api/me
│   │   ├── path.py           # GET /api/path
│   │   ├── lessons.py        # /api/lessons/{id}, /answer, /complete
│   │   ├── leaderboard.py    # GET /api/leaderboard
│   │   ├── profile.py        # GET /api/profile
│   │   ├── hearts.py         # POST /api/hearts/refill
│   │   └── dev.py            # POST /api/dev/simulate-day, GET /api/dev/state
│   └── services/             # Pure business logic & gamification engines
│       ├── date_service.py   # Global calendar & simulation date offset
│       ├── streak_service.py # Multi-day streak tracking & reset rules
│       ├── hearts_service.py # Lazy 30-min heart regeneration & refills
│       ├── exercise_service.py # Server-side answer grading & sanitization
│       ├── lesson_service.py # Lesson completion, XP math & achievement unlocks
│       ├── progress_service.py # Learning tree & next-skill unlocking
│       └── leaderboard_service.py # Weekly XP ranking engine
├── seed.py                   # Idempotent database seeder (Spanish course + users)
├── requirements.txt          # Python dependencies
└── tests/                    # Automated Pytest suite
```

---

## 🛠️ Installation & Setup

### 1. Create and Activate Virtual Environment
```bash
# Windows PowerShell
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Linux / macOS
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run Database Seeding
```bash
python seed.py
```
> **Note**: The application also automatically runs the seeder on startup if the database file is empty or missing (vital for zero-config deployments).

### 4. Start the FastAPI Development Server
```bash
uvicorn app.main:app --reload --port 8000
```
- Interactive Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- Interactive ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- Health Check: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## 🧪 Running Automated Tests

Run the full pytest suite:
```bash
pytest -v
```

---

## 🧠 Core Game Logic Explained

### 1. Lazy Heart Regeneration (30 Minutes / Heart)
Instead of managing heavy background threads or cron workers, hearts are lazily calculated on demand:
$$\text{elapsed} = \text{now} - \text{hearts\_updated\_at}$$
$$\text{hearts\_gained} = \lfloor \text{elapsed} / 1800\,\text{seconds} \rfloor$$
$$\text{new\_hearts} = \min(5, \text{current\_hearts} + \text{hearts\_gained})$$
Partial progress is preserved by shifting `hearts_updated_at` forward by exactly $(\text{hearts\_gained} \times 1800)\,\text{seconds}$.

### 2. Streak Tracking
- Evaluated whenever a lesson is completed:
  - Active **today**: Streak unchanged (no double-counting on the same day).
  - Active **yesterday**: Streak increments by **+1**.
  - Inactive for **$\ge 2$ days**: Streak resets back to **1**.
- The `/api/dev/simulate-day` endpoint enables simulated time travel to test multi-day streaks reliably.

### 3. Server-side Exercise Grading & Anti-Cheat Sanitization
- When `GET /api/lessons/{id}` is queried, all correct answers and secret explanations are stripped before transmission to the client.
- `POST /api/lessons/{id}/answer` performs fuzzy normalization (punctuation/accent tolerance, case folding, and word-token matching) entirely on the server.
# Phase 4 database note

On API startup, `run_migrations()` adds `users.longest_streak` to an existing SQLite database when it is missing. The achievement service then inserts any missing achievement definitions, so restart the backend after updating the code; no database wipe or manual reseed is needed. To restore the demo learner and progress for an evaluator walkthrough, use `POST /api/dev/reset`.
