import os

# IMPORTANT: Use a stable secret so JWT tokens survive server restarts.
# In production, set the JWT_SECRET_KEY environment variable.
# Using a fixed dev key here so tokens don't expire on restart.
_DEFAULT_DEV_SECRET = "insightx-dev-secret-key-do-not-use-in-production-32chars"
SECRET_KEY = os.getenv("JWT_SECRET_KEY", _DEFAULT_DEV_SECRET)

# Keep empty by default so API keys are never committed.
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")
DATABASE_PATH = os.path.join(os.path.dirname(__file__), "insightx.db")
CORS_ORIGINS = [
    "http://localhost:5173", # Vite Dev Server
    "http://127.0.0.1:5173",
    "http://localhost:8000",
    "chrome-extension://*",
    "*",
]
