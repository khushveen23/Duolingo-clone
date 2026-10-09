# Duolingo Web App Clone — Master Plan & Technical Specification

## 1. Project Overview & Architecture
This project is a full-stack clone of the Duolingo language learning web application designed with high visual fidelity, engaging gamification, and robust backend mechanics.

### Tech Stack
- **Backend (Phase 1)**: Python 3.12, FastAPI, SQLAlchemy 2.x ORM, SQLite, Pydantic v2, Pytest
- **Frontend (Phases 2 & 3)**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Web Audio API, Canvas Confetti
- **Database**: SQLite (file-based relational DB `backend/duolingo.db`)

---

## 2. Repository Layout
```text
ScalarAI_Duolingo/
├── PLAN.md                     # Master architecture & technical specification
├── README.md                   # Full repository documentation & setup instructions
├── frontend/                   # Next.js TypeScript web application (Phases 2 & 3)
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css     # Duolingo brand color tokens & 3D styling
│   │   │   ├── layout.tsx      # Root layout with UserProvider & ToastProvider
│   │   │   ├── page.tsx        # Home / Learn path view
│   │   │   ├── learn/page.tsx  # Learn path route alias
│   │   │   ├── leaderboard/page.tsx # Weekly Bronze League ranking
│   │   │   ├── quests/page.tsx # Daily Quests & gem rewards
│   │   │   ├── profile/page.tsx# Learner statistics & achievements
│   │   │   ├── more/page.tsx   # Shop & hearts refill
│   │   │   └── lesson/[id]/page.tsx # Interactive Lesson Player (Phase 3)
│   │   ├── components/
│   │   │   ├── ui/             # Reusable Button, Card, ProgressBar, Modal
│   │   │   ├── layout/         # Sidebar, TopBar, RightPanel, MainLayout
│   │   │   ├── path/           # UnitHeader, SkillNode, SkillPopover, PathView
│   │   │   └── lesson/         # LessonHeader, FeedbackBar, Mascot, LessonCompleteScreen
│   │   │       └── exercises/  # MultipleChoice, TranslateWordBank, MatchPairs, FillInBlank, TypeAnswer
│   │   ├── context/            # UserContext (global user stats) & ToastContext
│   │   ├── hooks/              # usePath, useLessonSession (state machine)
│   │   ├── lib/                # api.ts (typed client), sound.ts (Web Audio synthesizer)
│   │   └── types/              # TypeScript types matching Pydantic models
│   └── package.json
└── backend/                    # FastAPI backend service (Phase 1)
    ├── README.md               # Backend installation & execution guide
    ├── requirements.txt        # Python dependency manifest
    ├── seed.py                 # Database initialization & seed script
    ├── app/
    │   ├── main.py             # FastAPI entrypoint, CORS & auto-seed lifecycle
    │   ├── config.py           # Application settings & database paths
    │   ├── database.py         # SQLAlchemy engine, session maker & declarative Base
    │   ├── models/             # SQLAlchemy ORM models (User, Course, Unit, Skill, Lesson, Exercise, etc.)
    │   ├── schemas/            # Pydantic schemas for request/response validation
    │   ├── routers/            # REST API endpoints (/api/me, /api/path, /api/lessons, etc.)
    │   └── services/           # Encapsulated game logic (hearts, streaks, grading, XP)
    └── tests/                  # Pytest automated test suite (23 passing unit tests)
```

---

## 3. Database Schema Specification

### Relational Schema Diagram
```mermaid
erDiagram
    USERS ||--o{ USER_SKILL_PROGRESS : tracks
    USERS ||--o{ USER_LESSON_PROGRESS : completes
    USERS ||--o{ XP_EVENTS : earns
    USERS ||--o{ USER_ACHIEVEMENTS : unlocks

    COURSES ||--o{ UNITS : contains
    UNITS ||--o{ SKILLS : contains
    SKILLS ||--o{ LESSONS : contains
    LESSONS ||--o{ EXERCISES : contains

    SKILLS ||--o{ USER_SKILL_PROGRESS : progression
    LESSONS ||--o{ USER_LESSON_PROGRESS : progression
    ACHIEVEMENTS ||--o{ USER_ACHIEVEMENTS : unlocks

    USERS {
        int id PK
        string name
        int xp
        int weekly_xp
        int streak
        date last_active_date
        int hearts
        datetime hearts_updated_at
        int gems
        int daily_goal_xp
        datetime created_at
    }

    COURSES {
        int id PK
        string language
        string title
    }

    UNITS {
        int id PK
        int course_id FK
        int order
        string title
        string description
    }

    SKILLS {
        int id PK
        int unit_id FK
        int order
        string title
        string icon
        int total_levels
    }

    LESSONS {
        int id PK
        int skill_id FK
        int order
        int level
    }

    EXERCISES {
        int id PK
        int lesson_id FK
        int order
        string type
        string prompt
        json data
    }

    USER_SKILL_PROGRESS {
        int id PK
        int user_id FK
        int skill_id FK
        int levels_completed
        string status
        datetime updated_at
    }

    USER_LESSON_PROGRESS {
        int id PK
        int user_id FK
        int lesson_id FK
        datetime completed_at
        int xp_earned
    }

    XP_EVENTS {
        int id PK
        int user_id FK
        int amount
        datetime created_at
    }

    ACHIEVEMENTS {
        int id PK
        string code
        string title
        string description
        string icon
        int target_value
        string category
    }

    USER_ACHIEVEMENTS {
        int id PK
        int user_id FK
        int achievement_id FK
        datetime unlocked_at
        int progress
    }
```

---

## 4. Exercise Types & Grading Rules

1. **`multiple_choice`**:
   - `prompt`: Question or sentence to translate.
   - `data`: Options list, single correct option, explanation.
   - Client gets: Options list (shuffled), question.
   - Server checks: Exact string match with target choice.

2. **`translate_word_bank`**:
   - `prompt`: Sentence in source language with character speech bubble.
   - `data`: Tokenized word bank tiles + distractors, ordered target tokens.
   - Client gets: Word bank tiles (shuffled).
   - Server checks: Array sequence or joined string matching target translation.

3. **`match_pairs`**:
   - `prompt`: Match vocabulary terms between two columns.
   - `data`: List of key-value term pairs.
   - Client gets: Left column and randomized right column.
   - Server checks: All pairs correctly mapped.

4. **`fill_in_blank`**:
   - `prompt`: Sentence with blank placeholder (e.g., `Ella ___ una manzana.`).
   - `data`: Sentence text, option choices, correct word.
   - Client gets: Sentence text with blank, options list.
   - Server checks: Selected word fills the blank correctly.

5. **`type_answer`**:
   - `prompt`: Prompt sentence to translate manually via keyboard with Spanish accents row.
   - `data`: Target sentence, list of acceptable alternate spellings/punctuation.
   - Client gets: Prompt sentence.
   - Server checks: Case-insensitive, accent-tolerant, punctuation-trimmed string comparison.

---

## 5. Core Game Mechanics

### Streak System
- Evaluated on lesson completion:
  - If `last_active_date == today`: Same day activity. Streak preserved (no double-increment).
  - If `last_active_date == today - 1 day`: Consecutive day. Streak incremented by +1.
  - If `last_active_date < today - 1 day` or `None`: Inactivity gap. Streak resets to 1.
  - `last_active_date` updated to `today`.

### Lazy Heart Regeneration System
- Maximum hearts: 5.
- Regeneration rate: 1 heart per 30 minutes (1800 seconds).
- Deductions: -1 heart on incorrect answer. If hearts reach 0, response sets `lesson_failed = True` and prompts the "Out of Hearts" modal.

### Experience Points (XP) & Daily Goals
- Standard lesson completion awards **10 XP**.
- Perfect lesson (zero mistakes) awards **+5 bonus XP** (Total **15 XP**).
- Recorded as an immutable `XPEvent` entry and compared against `daily_goal_xp`.

---

## 6. Phase 3: Lesson State Machine Architecture

The lesson player is driven by the [`useLessonSession`](file:///e:/Downloads%20new/projects_work/ScalarAI_Duolingo/frontend/src/hooks/useLessonSession.ts) custom state hook:

```mermaid
stateDiagram-v2
    [*] --> loading : Mount /lesson/[id]
    loading --> in_exercise : Exercises loaded
    loading --> error : API failed

    state in_exercise {
        [*] --> awaiting_answer
        awaiting_answer --> answer_selected : User inputs answer
        answer_selected --> awaiting_answer : User clears answer
    }

    in_exercise --> checking : Click CHECK / Press ENTER
    
    state checking {
        [*] --> validate_server : POST /api/lessons/{id}/answer
    }

    checking --> feedback_correct : Correct answer
    checking --> feedback_incorrect : Incorrect answer (Heart -1, Exercise queued to end)
    checking --> hearts_empty : Hearts == 0

    feedback_correct --> in_exercise : Click CONTINUE (More exercises left)
    feedback_correct --> submitting_completion : Click CONTINUE (Last exercise)
    
    feedback_incorrect --> in_exercise : Click CONTINUE (Advance to next in queue)
    
    hearts_empty --> in_exercise : Refill Hearts (/api/hearts/refill)
    hearts_empty --> [*] : Exit to /learn

    submitting_completion --> completed : POST /api/lessons/{id}/complete
    completed --> [*] : Click CONTINUE (Return to /learn & refresh UserContext)
```
