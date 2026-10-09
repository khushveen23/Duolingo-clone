# Duolingo Web Application Clone

A full-stack, gamified language learning web application designed to replicate Duolingo's visual elegance, responsive learning paths, interactive exercise mechanics, and gamification workflows.

---

## 🚀 Tech Stack Overview

- **Backend**: Python 3.12, FastAPI, SQLAlchemy 2.x ORM, SQLite, Pydantic v2, Pytest
- **Frontend (Phase 2)**: Next.js 14+ (App Router), TypeScript, TailwindCSS / CSS Modules, Framer Motion, Howler.js, Lucide Icons
- **Database**: SQLite with relational schema and cascade constraints

---

## 📂 Repository Structure

```text
.
├── PLAN.md               # Master technical plan, schema specs & roadmap
├── README.md             # Project documentation and developer quickstart
├── backend/              # FastAPI Python backend service
│   ├── app/              # Modular application code (models, schemas, routers, services)
│   ├── tests/            # Automated Pytest suite
│   ├── seed.py           # Database seeder (Courses, Lessons, Seed Users)
│   ├── requirements.txt  # Backend dependencies
│   └── README.md         # Backend setup & architecture guide
└── frontend/             # Next.js TypeScript web application (Phase 2)
    └── README.md
```

---

## ⚡ Quick Start — Backend (Phase 1)

```bash
# Navigate to backend
cd backend

# Setup Python environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1  # (On Windows)
# or: source .venv/bin/activate (On Mac/Linux)

# Install packages
pip install -r requirements.txt

# Seed the database
python seed.py

# Run the API server
uvicorn app.main:app --reload --port 8000
```

- API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
- Run Tests: `pytest -v`

---

## 🎮 Gamification Mechanics Summary

- **Streak Engine**: Increments on consecutive day activity, handles same-day deduplication, and resets on missed days.
- **Hearts Engine**: Maximum 5 hearts. Regenerates 1 heart every 30 minutes lazily without cron overhead.
- **5 Exercise Formats**:
  1. Multiple Choice
  2. Translate with Word Bank
  3. Match Vocabulary Pairs
  4. Fill in the Blank
  5. Free Typing with Fuzzy Accent/Punctuation Tolerance
- **Progression & Unlocking**: Completing lessons unlocks subsequent skills and units dynamically.
- **Weekly Leaderboard**: Ranked competitor ladder updated in real-time.
