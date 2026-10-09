from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.user import User

class LeaderboardService:
    @classmethod
    def get_leaderboard(cls, db: Session, current_user: User, limit: int = 20) -> list[dict]:
        """
        Returns ranked users by weekly_xp with user identification.
        """
        users = db.query(User).order_by(desc(User.weekly_xp), desc(User.xp)).limit(limit).all()

        leaderboard = []
        for index, u in enumerate(users, start=1):
            leaderboard.append({
                "rank": index,
                "user_id": u.id,
                "name": u.name,
                "weekly_xp": u.weekly_xp,
                "total_xp": u.xp,
                "streak": u.streak,
                "avatar_url": u.avatar_url or f"https://api.dicebear.com/7.x/bottts/svg?seed={u.name}",
                "is_current_user": (u.id == current_user.id),
            })

        return leaderboard

leaderboard_service = LeaderboardService()
