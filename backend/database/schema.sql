CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    video_id TEXT NOT NULL,
    title TEXT,
    channel_name TEXT,
    view_count INTEGER,
    like_count INTEGER,
    comment_count INTEGER,
    comments_analyzed INTEGER,
    thumbnail_url TEXT,
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS analysis_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    video_id INTEGER NOT NULL,
    
    -- Sentiment
    sentiment_positive REAL,
    sentiment_neutral REAL,
    sentiment_negative REAL,
    positive_count INTEGER,
    neutral_count INTEGER,
    negative_count INTEGER,
    
    -- Keywords (JSON array)
    keywords TEXT,
    
    -- Topics (JSON array)
    topics TEXT,
    
    -- Categories
    praise_count INTEGER,
    questions_count INTEGER,
    complaints_count INTEGER,
    suggestions_count INTEGER,
    general_count INTEGER,
    
    -- Detailed Analysis (JSON objects)
    praise_breakdown TEXT,
    complaints_breakdown TEXT,
    top_questions TEXT,
    content_demand TEXT,
    recommended_actions TEXT,
    
    -- Summary
    executive_summary TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (video_id) REFERENCES videos(id)
);

CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    video_id INTEGER NOT NULL,
    comment_text TEXT NOT NULL,
    author TEXT,
    likes INTEGER DEFAULT 0,
    published_at TEXT,
    sentiment TEXT,
    category TEXT,
    FOREIGN KEY (video_id) REFERENCES videos(id)
);

CREATE INDEX IF NOT EXISTS idx_video_user ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_video_id ON videos(video_id);
CREATE INDEX IF NOT EXISTS idx_analysis_video ON analysis_results(video_id);
