from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List

from database.database import get_db_connection
from database.models import DashboardVideosResponse, VideoHistory
from routes.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/videos", response_model=DashboardVideosResponse)
async def get_dashboard_videos(current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT v.id, v.video_id, v.title, v.channel_name, v.view_count, v.comment_count, v.analyzed_at, v.thumbnail_url
        FROM videos v
        WHERE v.user_id = ?
        ORDER BY v.analyzed_at DESC
        LIMIT 10
    """, (current_user["id"],))
    
    videos = cursor.fetchall()
    conn.close()
    
    formatted_videos = []
    for v in videos:
        formatted_videos.append({
            "id": v["id"],
            "video_id": v["video_id"],
            "title": v["title"] or "Unknown Title",
            "channel_name": v["channel_name"] or "Unknown Channel",
            "view_count": v["view_count"] or 0,
            "comment_count": v["comment_count"] or 0,
            "thumbnail_url": v["thumbnail_url"] or f"https://img.youtube.com/vi/{v['video_id']}/mqdefault.jpg",
            "analyzed_at": str(v["analyzed_at"]),
            "sentiment_summary": {
                "positive_percent": 0.0,
                "negative_percent": 0.0
            },
            "top_action": "Re-analyze to view insights"
        })
        
    return {"videos": formatted_videos}

@router.get("/video/{db_video_id}")
async def get_video_analysis(db_video_id: int, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # We first join videos and analysis_results to ensure the user owns it
    cursor.execute("""
        SELECT a.*, v.title, v.channel_name
        FROM analysis_results a
        JOIN videos v ON a.video_id = v.id
        WHERE v.id = ? AND v.user_id = ?
    """, (db_video_id, current_user["id"]))
    
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    return {
        "analysis_id": row["id"],
        "video_title": row["title"],
        "channel_name": row["channel_name"],
        "summary": row["executive_summary"],
        "sentiment": {
            "positive_percent": row["sentiment_positive"],
            "neutral_percent": row["sentiment_neutral"],
            "negative_percent": row["sentiment_negative"],
            "positive_count": row["positive_count"],
            "neutral_count": row["neutral_count"],
            "negative_count": row["negative_count"]
        },
        "categories": {
            "praise": row["praise_count"],
            "questions": row["questions_count"],
            "complaints": row["complaints_count"],
            "suggestions": row["suggestions_count"],
            "general": row["general_count"]
        },
        "keywords": json.loads(row["keywords"]),
        "topics": json.loads(row["topics"]),
        "praise_breakdown": json.loads(row["praise_breakdown"]),
        "complaints_breakdown": json.loads(row["complaints_breakdown"]),
        "top_questions": json.loads(row["top_questions"]),
        "content_demand": json.loads(row["content_demand"]),
        "recommended_actions": json.loads(row["recommended_actions"])
    }
