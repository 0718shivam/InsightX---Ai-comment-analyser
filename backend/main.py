from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import CORS_ORIGINS
from database.database import init_db
from routes import auth, analyze, dashboard

app = FastAPI(title="InsightX API", description="AI-Powered YouTube Comment Analytics Platform API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=r"chrome-extension://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

app.include_router(auth.router)
app.include_router(analyze.router)
app.include_router(dashboard.router)

@app.get("/")
async def root():
    return {"message": "Welcome to InsightX API"}
