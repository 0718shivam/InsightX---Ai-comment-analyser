from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
import sqlite3

from database.database import get_db_connection
from database.models import UserSignup, UserLogin, Token, UserResponse
from utils.auth import get_password_hash, verify_password, create_access_token, verify_token

router = APIRouter(prefix="/auth", tags=["auth"])

def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.split(" ")[1]
    payload = verify_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
        
    return {"id": payload.get("user_id"), "email": payload.get("email")}

@router.post("/signup", response_model=Token)
async def signup(user: UserSignup):
    if len(user.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
        
    hashed_password = get_password_hash(user.password)
    
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO users (email, password_hash) VALUES (?, ?)", (user.email, hashed_password))
        conn.commit()
        user_id = cursor.lastrowid
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=409, detail="Email already registered")
    
    conn.close()
    
    token = create_access_token(user_id, user.email)
    return {"token": str(token), "user": {"id": user_id, "email": user.email}}

@router.post("/login", response_model=Token)
async def login(user: UserLogin):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, password_hash FROM users WHERE email = ?", (user.email,))
    db_user = cursor.fetchone()
    conn.close()
    
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    if not verify_password(user.password, db_user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    token = create_access_token(db_user["id"], db_user["email"])
    return {"token": str(token), "user": {"id": db_user["id"], "email": db_user["email"]}}

@router.get("/verify", response_model=dict)
async def verify(current_user: dict = Depends(get_current_user)):
    return {"user": current_user}
