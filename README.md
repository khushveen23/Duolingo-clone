# 🦜 Duolingo Clone

A full-stack, gamified language learning web application replicating Duolingo's visual design, interactive exercise mechanics, progression system, and gamification engine.

> **Live Repo:** [github.com/khushveen23/Duolingo-clone](https://github.com/khushveen23/Duolingo-clone)

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Python 3.12, FastAPI, SQLAlchemy 2.x, SQLite, Pydantic v2 |
| **Frontend** | Next.js 16.4 (App Router), React 19, TypeScript, TailwindCSS v4 |
| **Animations** | Lottie React, Framer Motion |
| **Icons** | Lucide React |
| **Testing** | Pytest, pytest-asyncio, HTTPX |

---

## 📂 Project Structure

```
.
├── README.md
├── PLAN.md                          # Master technical plan & roadmap
├── backend/                         # FastAPI Python backend
│   ├── app/
│   │   ├── main.py                  # App entrypoint, lifespan, CORS, routers
│   │   ├── config.py                # Settings (pydantic-settings)
│   │   ├── database.py              # SQLAlchemy engine & session
│   │   ├── models/                  # ORM models (User, Course, Unit, Skill, Lesson, Exercise, XP, Achievement)
│   │   ├── schemas/                 # Pydantic request/response schemas
│   │   ├── routers/                 # API route handlers (me, path, lessons, leaderboard, profile, hearts, dev)
│   │   └── services/                # Business logic (streak, hearts, XP, achievements, leaderboard)
│   ├── seed.py                      # Database seeder
│   ├── requirements.txt
│   └── tests/                       # Pytest test suite
└── frontend/                        # Next.js web application
    ├── src/
    │   ├── app/                     # App Router pages
    │   │   ├── page.tsx             # Home / Login
    │   │   ├── learn/               # Learning path
    │   │   ├── lesson/[id]/         # Lesson exercise player
    │   │   ├── leaderboard/         # Weekly leaderboard
    │   │   ├── profile/             # User profile & stats
    │   │   ├── quests/              # Daily quests
    │   │   ├── shop/                # Gem shop
    │   │   ├── settings/            # User settings
    │   │   └── more/                # More page
    │   ├── components/
    │   │   ├── layout/              # MainLayout, Sidebar, TopBar, RightPanel, modals
    │   │   ├── lesson/              # Exercise player, FeedbackBar, LessonHeader, Mascot
    │   │   ├── lesson/exercises/    # MultipleChoice, TranslateWordBank, MatchPairs, FillInBlank, TypeAnswer
    │   │   ├── path/                # PathView, SkillNode, SkillPopover, UnitHeader
    │   │   ├── profile/             # XPBarChart, AchievementModal, SettingsModal
    │   │   ├── gamification/        # Gamification overlays
    │   │   └── ui/                  # Button, Card, Modal, ProgressBar, LottieAnimation
    │   ├── context/                 # UserContext, ToastContext
    │   ├── hooks/                   # useLessonSession, usePath
    │   ├── lib/                     # api.ts (Axios client), sound.ts
    │   └── types/                   # Shared TypeScript types
    └── public/animations/           # Lottie JSON assets
```

---

## ⚡ Quick Start

### Prerequisites

- Python 3.12+
- Node.js 18+

---

### 1. Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1        # Windows
# source .venv/bin/activate         # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Start the API server (auto-seeds DB on first run)
uvicorn app.main:app --reload --port 8000
```

- **API:** [http://localhost:8000](http://localhost:8000)
- **Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Run Tests:** `pytest -v`

> The database is auto-created and seeded on first startup — no manual `seed.py` run needed.

---

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

- **App:** [http://localhost:3000](http://localhost:3000)

> Make sure the backend is running on port `8000` before starting the frontend.

---

## 🎮 Features

### Gamification Engine
- **Streak System** — Tracks daily streaks, handles same-day deduplication, resets on missed days
- **Hearts Engine** — Max 5 hearts; regenerates 1 heart every 30 minutes (lazy, no cron)
- **XP & Levelling** — XP awarded per lesson completion, tracked with full event history
- **Achievements** — Milestone-based badges unlocked automatically

### Learning Experience
- **5 Exercise Types:**
  1. Multiple Choice
  2. Translate with Word Bank
  3. Match Vocabulary Pairs
  4. Fill in the Blank
  5. Free Typing (with fuzzy accent/punctuation tolerance)
- **Skill Progression** — Completing lessons dynamically unlocks the next skills and units
- **Weekly Leaderboard** — Live ranked competitor ladder

### UI / UX
- Duolingo-inspired sidebar navigation with active state indicators
- Animated Lottie mascots and celebration screens
- Real-time toast notifications
- Responsive layout with right panel for streak/league info

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/me` | Get current user profile |
| `GET` | `/api/v1/path` | Get full learning path |
| `GET` | `/api/v1/lessons/{id}` | Get lesson with exercises |
| `POST` | `/api/v1/lessons/{id}/complete` | Submit lesson & award XP |
| `GET` | `/api/v1/leaderboard` | Weekly leaderboard |
| `GET` | `/api/v1/profile` | Profile stats & achievements |
| `GET` | `/api/v1/hearts` | Heart status |
| `POST` | `/api/v1/hearts/refill` | Refill hearts |
| `GET` | `/docs` | Interactive Swagger UI |

---

## 🧪 Running Tests

```bash
cd backend
pytest -v
```

Test coverage includes: streak logic, heart regeneration, exercise grading, lesson API, and achievements.

---

## 👤 Author

**Khushveen Sadiora** — [ksadiora_be23@thapar.edu](mailto:ksadiora_be23@thapar.edu)
