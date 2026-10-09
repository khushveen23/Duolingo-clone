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

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response


class OptionsMiddleware(BaseHTTPMiddleware):
    """Intercept all OPTIONS requests and return 200 OK with full CORS headers."""
    async def dispatch(self, request, call_next):
        if request.method == "OPTIONS":
            response = Response(content="OK", status_code=200, media_type="text/plain")
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD"
            response.headers["Access-Control-Allow-Headers"] = "*"
            response.headers["Access-Control-Max-Age"] = "86400"
            return response
        return await call_next(request)


class PathNormalizationMiddleware(BaseHTTPMiddleware):
    """Normalize Vercel serverless path prefixes like /api/index.py or /api/index."""
    async def dispatch(self, request, call_next):
        path = request.scope.get("path", "")
        for prefix in ["/api/index.py", "/api/index"]:
            if path == prefix or path == prefix + "/":
                request.scope["path"] = "/"
                break
            elif path.startswith(prefix + "/"):
                request.scope["path"] = path[len(prefix):]
                break
        return await call_next(request)


# Configure Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(OptionsMiddleware)
app.add_middleware(PathNormalizationMiddleware)

# Mount Routers under /api
app.include_router(me_router, prefix=settings.API_V1_STR)
app.include_router(path_router, prefix=settings.API_V1_STR)
app.include_router(lessons_router, prefix=settings.API_V1_STR)
app.include_router(leaderboard_router, prefix=settings.API_V1_STR)
app.include_router(profile_router, prefix=settings.API_V1_STR)
app.include_router(hearts_router, prefix=settings.API_V1_STR)
app.include_router(dev_router, prefix=settings.API_V1_STR)

@app.api_route("/", methods=["GET", "POST", "HEAD", "OPTIONS"], tags=["Health"])
@app.api_route("/api", methods=["GET", "POST", "HEAD", "OPTIONS"], tags=["Health"])
@app.api_route("/api/", methods=["GET", "POST", "HEAD", "OPTIONS"], tags=["Health"])
def root():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
    }

@app.api_route("/api/health", methods=["GET", "POST", "HEAD", "OPTIONS"], tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
    }


