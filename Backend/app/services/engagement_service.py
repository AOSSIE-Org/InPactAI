from typing import List, Optional, Dict, Any

try:
    from app.models.models import UserPost  # for typing clarity
except Exception:
    # Fallback for type hints if import is not available at runtime
    class UserPost:  # type: ignore
        engagement_metrics: Dict[str, Any]


def compute_engagement_metrics(posts: List[UserPost], follower_count: Optional[int]) -> Dict[str, Any]:
    """
    Compute standardized engagement metrics using existing UserPost.engagement_metrics JSON.

    - likes, comments, shares are totals across posts
    - avg_* are per-post averages (0.0 when no posts)
    - engagement_rate = (likes + comments + shares) / follower_count
      (None when follower_count is missing or <= 0)
    - total_posts is count of posts
    - follower_count echoed back in response
    """
    total_likes = 0
    total_comments = 0
    total_shares = 0

    for post in posts:
        metrics = getattr(post, "engagement_metrics", {}) or {}
        # Defensive defaults
        likes = int(metrics.get("likes", 0) or 0)
        comments = int(metrics.get("comments", 0) or 0)
        shares = int(metrics.get("shares", 0) or 0)

        total_likes += likes
        total_comments += comments
        total_shares += shares

    total_posts = len(posts)

    if total_posts > 0:
        avg_likes = total_likes / total_posts
        avg_comments = total_comments / total_posts
        avg_shares = total_shares / total_posts
    else:
        avg_likes = 0.0
        avg_comments = 0.0
        avg_shares = 0.0

    engagement_rate: Optional[float]
    if follower_count and follower_count > 0:
        engagement_rate = (total_likes + total_comments + total_shares) / follower_count
    else:
        engagement_rate = None

    return {
        "likes": total_likes,
        "comments": total_comments,
        "shares": total_shares,
        "avg_likes": avg_likes,
        "avg_comments": avg_comments,
        "avg_shares": avg_shares,
        "engagement_rate": engagement_rate,
        "total_posts": total_posts,
        "follower_count": follower_count,
    }