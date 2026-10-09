from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.routers import (
    me_router,
    path_router,
    lessons_router,
    leaderboard_router,
    profile_router,
    hearts_router,
    dev_router,
)
from seed import seed_database
from app.services.achievement_service import achievement_service


def run_migrations():
    """Ensure newly added columns exist in existing SQLite databases."""
    with engine.connect() as conn:
        try:
            # Check users table columns
            res = conn.execute(text("PRAGMA table_info(users)"))
            cols = [row[1] for row in res.fetchall()]
            if "longest_streak" not in cols and len(cols) > 0:
                conn.execute(text("ALTER TABLE users ADD COLUMN longest_streak INTEGER DEFAULT 0 NOT NULL"))
                conn.commit()
        except Exception:
            pass


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup and shutdown lifecycle event handler.
    Automatically creates database tables, runs column migrations, and runs seeding if empty.
    """
    # 1. Ensure all database tables exist
    Base.metadata.create_all(bind=engine)

    # 2. Run column migrations for SQLite
    run_migrations()
    
    # 3. Seed initial data if tables are empty
    db = SessionLocal()
    try:
        seed_database(db=db)
        achievement_service.ensure_achievements_seeded(db)
        db.commit()
    finally:
        db.close()

    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Duolingo Clone REST API — Gamification & Progress Backend",
    lifespan=lifespan,
)

# Configure Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers under /api
app.include_router(me_router, prefix=settings.API_V1_STR)
app.include_router(path_router, prefix=settings.API_V1_STR)
app.include_router(lessons_router, prefix=settings.API_V1_STR)
app.include_router(leaderboard_router, prefix=settings.API_V1_STR)
app.include_router(profile_router, prefix=settings.API_V1_STR)
app.include_router(hearts_router, prefix=settings.API_V1_STR)
app.include_router(dev_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Health"])
def root():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
    }

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
    }
