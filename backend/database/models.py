from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any

class UserSignup(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str

class Token(BaseModel):
    token: str
    user: UserResponse

class AnalyzeRequest(BaseModel):
    video_id: str
    comment_limit: int = 500

class Sentiment(BaseModel):
    positive_percent: float
    neutral_percent: float
    negative_percent: float
    positive_count: int
    neutral_count: int
    negative_count: int

class Categories(BaseModel):
    praise: int
    questions: int
    complaints: int
    suggestions: int
    general: int

class Keyword(BaseModel):
    keyword: str
    score: float

class Topic(BaseModel):
    topic_id: int
    keywords: List[str]

class AnalysisResponse(BaseModel):
    analysis_id: int
    video_title: str
    channel_name: str
    summary: str
    sentiment: Sentiment
    categories: Categories
    keywords: List[Keyword]
    topics: List[Topic]
    praise_breakdown: Dict[str, Any]
    complaints_breakdown: Dict[str, Any]
    top_questions: List[Dict[str, Any]]
    content_demand: Dict[str, Any]
    recommended_actions: Dict[str, Any]

class VideoHistory(BaseModel):
    id: int
    video_id: str
    title: str
    channel_name: str
    view_count: int
    comment_count: int
    thumbnail_url: Optional[str] = None
    analyzed_at: str
    sentiment_summary: Dict[str, float]
    top_action: str

class DashboardVideosResponse(BaseModel):
    videos: List[VideoHistory]
