from app.routers.me import router as me_router
from app.routers.path import router as path_router
from app.routers.lessons import router as lessons_router
from app.routers.leaderboard import router as leaderboard_router
from app.routers.profile import router as profile_router
from app.routers.hearts import router as hearts_router
from app.routers.dev import router as dev_router

__all__ = [
    "me_router",
    "path_router",
    "lessons_router",
    "leaderboard_router",
    "profile_router",
    "hearts_router",
    "dev_router",
]
