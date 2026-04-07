"""
InsightX Real Analysis Server — ZERO pip dependencies!
Run: python server.py
This fetches REAL YouTube comments and performs REAL NLP analysis.
Uses only Python standard library (http.server, urllib, json, re, collections).
"""
import json
import re
import sqlite3
import urllib.request
import urllib.parse
import hashlib
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
from collections import Counter

# ===== CONFIG =====
PORT = 8000
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")

# ===== DATABASE =====
def init_db():
    conn = sqlite3.connect("insightx.db", check_same_thread=False)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        hashed_password TEXT NOT NULL
    )''')
    conn.commit()
    return conn

DB = init_db()

# ===== YOUTUBE API (using urllib — no pip!) =====
def yt_fetch_metadata(video_id):
    url = f"https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id={video_id}&key={YOUTUBE_API_KEY}"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
        if not data.get("items"):
            return {"title": f"Video {video_id}", "channelTitle": "Unknown", "viewCount": 0}
        item = data["items"][0]
        return {
            "title": item["snippet"]["title"],
            "channelTitle": item["snippet"]["channelTitle"],
            "viewCount": int(item["statistics"].get("viewCount", 0)),
        }
    except Exception as e:
        print(f"[WARN] YouTube metadata fetch failed: {e}")
        return {"title": f"Video {video_id}", "channelTitle": "Unknown", "viewCount": 0}

def yt_fetch_comments(video_id, max_results=100):
    comments = []
    next_page = None
    while len(comments) < max_results:
        params = {
            "part": "snippet",
            "videoId": video_id,
            "maxResults": min(100, max_results - len(comments)),
            "textFormat": "plainText",
            "order": "relevance",
            "key": YOUTUBE_API_KEY,
        }
        if next_page:
            params["pageToken"] = next_page
        url = "https://www.googleapis.com/youtube/v3/commentThreads?" + urllib.parse.urlencode(params)
        try:
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode())
            for item in data.get("items", []):
                txt = item["snippet"]["topLevelComment"]["snippet"]["textDisplay"]
                comments.append(txt)
                if len(comments) >= max_results:
                    break
            next_page = data.get("nextPageToken")
            if not next_page:
                break
        except Exception as e:
            print(f"[WARN] Comment fetch failed: {e}")
            break
    return comments

# ===== NLP ENGINE (pure Python) =====
POSITIVE_WORDS = {"love", "good", "great", "awesome", "excellent", "amazing", "thanks",
    "helpful", "perfect", "wow", "nice", "best", "beautiful", "fantastic", "wonderful",
    "cool", "brilliant", "incredible", "fire", "goat", "legend", "legendary", "masterpiece",
    "insane", "absolute", "underrated", "inspiring", "genius", "classic", "epic"}

NEGATIVE_WORDS = {"bad", "terrible", "worst", "awful", "hate", "boring", "fake", "sucks",
    "disappointing", "horrible", "trash", "poor", "cringe", "annoying", "clickbait",
    "overrated", "waste", "ugly", "scam", "useless", "wrong", "stupid"}

STOP_WORDS = {"the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "with", "about", "this", "that", "it", "is", "was", "are", "were", "be", "been",
    "i", "you", "we", "they", "he", "she", "my", "your", "our", "their", "of", "as",
    "like", "just", "so", "very", "much", "too", "how", "what", "video", "videos",
    "channel", "can", "will", "not", "have", "has", "had", "do", "does", "did", "if",
    "from", "would", "could", "should", "all", "more", "one", "than", "its", "his",
    "her", "who", "when", "where", "which", "there", "been", "being", "man", "got",
    "get", "dont", "dont", "really", "gonna", "still", "even", "back", "know", "make",
    "want", "see", "come", "think", "also", "need", "here", "every", "never"}

def sentiment(text):
    words = set(re.findall(r'\b\w+\b', text.lower()))
    p = len(words & POSITIVE_WORDS)
    n = len(words & NEGATIVE_WORDS)
    if p > n: return "positive"
    if n > p: return "negative"
    return "neutral"

def extract_keywords(comments, top_n=10):
    all_w = []
    for t in comments:
        ws = re.findall(r'\b[a-zA-Z]{3,}\b', t.lower())
        all_w.extend([w for w in ws if w not in STOP_WORDS])
    counts = Counter(all_w)
    top = counts.most_common(top_n)
    mx = top[0][1] if top else 1
    return [{"keyword": w, "score": round((c / mx) * 100)} for w, c in top]

def classify_comments(comments):
    cats = {"praise": 0, "questions": 0, "complaints": 0, "suggestions": 0, "general": 0}
    praise_ex, complaint_ex, question_ex = [], [], []

    for t in comments:
        low = t.lower()
        if "?" in t or any(low.startswith(w) for w in ["how ", "what ", "why ", "where ", "can ", "will ", "when "]):
            cats["questions"] += 1
            question_ex.append(t)
        else:
            s = sentiment(t)
            if s == "positive":
                cats["praise"] += 1
                if len(t) > 15: praise_ex.append(t)
            elif s == "negative":
                cats["complaints"] += 1
                if len(t) > 15: complaint_ex.append(t)
            elif "should" in low or "could" in low or "maybe" in low or "please" in low:
                cats["suggestions"] += 1
            else:
                cats["general"] += 1

    # Build breakdowns
    praise_bd = {}
    if praise_ex:
        praise_bd["positive_feedback"] = {"count": len(praise_ex), "examples": [praise_ex[0][:120]]}

    complaints_bd = {}
    if complaint_ex:
        complaints_bd["general_issues"] = {
            "count": len(complaint_ex),
            "examples": [complaint_ex[0][:120]],
            "solution": "Review and address the negative feedback patterns."
        }

    top_q = []
    seen_q = set()
    for q in question_ex[:5]:
        short = q[:80].strip()
        if short not in seen_q:
            seen_q.add(short)
            top_q.append({
                "question": short,
                "frequency": max(1, question_ex.count(q)),
                "opportunity": "Many viewers are asking this."
            })

    return cats, praise_bd, complaints_bd, top_q

def run_analysis(video_id, comment_limit=100):
    print(f"[*] Analyzing video: {video_id}")
    
    # 1. Fetch metadata
    meta = yt_fetch_metadata(video_id)
    
    # 2. Fetch comments
    comments = yt_fetch_comments(video_id, max_results=comment_limit)
    total = len(comments)
    print(f"[*] Fetched {total} comments")
    
    if total == 0:
        return {
            "video_title": meta["title"],
            "channel_name": meta["channelTitle"],
            "summary": "No comments found for this video (comments may be disabled or API quota exceeded).",
            "sentiment": {"positive_percent": 0, "neutral_percent": 0, "negative_percent": 0,
                          "positive_count": 0, "neutral_count": 0, "negative_count": 0},
            "categories": {"praise": 0, "questions": 0, "complaints": 0, "suggestions": 0, "general": 0},
            "keywords": [],
            "praise_breakdown": {},
            "complaints_breakdown": {},
            "top_questions": [],
            "content_demand": {"high_demand": {}},
            "recommended_actions": {"urgent": [], "next_video_ideas": []}
        }
    
    # 3. Sentiment
    pos = sum(1 for c in comments if sentiment(c) == "positive")
    neg = sum(1 for c in comments if sentiment(c) == "negative")
    neu = total - pos - neg
    
    pos_pct = round((pos / total) * 100)
    neg_pct = round((neg / total) * 100)
    neu_pct = 100 - pos_pct - neg_pct
    
    # 4. Keywords
    keywords = extract_keywords(comments, top_n=10)
    
    # 5. Categories
    cats, praise_bd, complaints_bd, top_q = classify_comments(comments)
    
    # 6. Actions
    actions = {"urgent": [], "next_video_ideas": []}
    if cats["complaints"] > 0:
        actions["urgent"].append({
            "action": f"Review {cats['complaints']} negative comments",
            "impact": "High",
            "effort": "Low"
        })
    top_kw = keywords[0]["keyword"] if keywords else "content"
    actions["next_video_ideas"].append({
        "topic": f"{top_kw.title()} Deep Dive",
        "demand": "High" if cats["questions"] > 5 else "Moderate",
        "estimated_views": meta["viewCount"] // 5 if meta["viewCount"] > 0 else 500,
        "suggested_structure": ["Introduction", "Core Analysis", "Audience Q&A"]
    })
    
    # 7. Content Demand
    content_demand = {"high_demand": {}}
    if cats["questions"] > 3:
        content_demand["high_demand"]["answering_questions"] = {
            "request_count": cats["questions"],
            "estimated_views": cats["questions"] * 500
        }
    
    # 8. Summary
    tone = "positive" if pos_pct > 60 else "mixed" if pos_pct > 40 else "negative"
    kw_str = ", ".join([k["keyword"] for k in keywords[:5]])
    summary = (
        f"Analyzed {total} real comments for '{meta['title']}'. "
        f"The audience reception is {tone} ({pos_pct}% positive, {neg_pct}% negative). "
        f"Viewers frequently discussed: {kw_str}. "
        f"There were {cats['questions']} questions and {cats['complaints']} complaints detected."
    )
    
    return {
        "video_title": meta["title"],
        "channel_name": meta["channelTitle"],
        "summary": summary,
        "sentiment": {
            "positive_percent": pos_pct,
            "neutral_percent": neu_pct,
            "negative_percent": neg_pct,
            "positive_count": pos,
            "neutral_count": neu,
            "negative_count": neg,
        },
        "categories": cats,
        "keywords": keywords,
        "praise_breakdown": praise_bd,
        "complaints_breakdown": complaints_bd,
        "top_questions": top_q,
        "content_demand": content_demand,
        "recommended_actions": actions,
    }

# ===== HTTP SERVER =====
class InsightXHandler(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        self._cors_headers(200)

    def do_GET(self):
        self._cors_headers(200)
        if self.path == "/" or self.path == "":
            self.wfile.write(json.dumps({
                "message": "InsightX API is running!",
                "endpoints": ["/auth/login", "/auth/signup", "/analyze/video"]
            }).encode())
        elif self.path.startswith("/auth/verify"):
            self.wfile.write(json.dumps({"status": "ok"}).encode())
        elif self.path.startswith("/dashboard/videos"):
            self.wfile.write(json.dumps({"videos": []}).encode())
        else:
            self.wfile.write(json.dumps({"error": "Not found"}).encode())

    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length) if length else b"{}"
        data = json.loads(body.decode('utf-8'))

        self._cors_headers(200)

        if self.path == "/auth/login" or self.path == "/auth/signup":
            email = data.get("email", "user@test.com")
            pw = data.get("password", "pass")
            # Simple user management
            try:
                DB.execute("INSERT OR IGNORE INTO users (email, hashed_password) VALUES (?, ?)",
                           (email, hashlib.sha256(pw.encode()).hexdigest()))
                DB.commit()
            except:
                pass
            token = hashlib.sha256(email.encode()).hexdigest()[:32]
            resp = {"access_token": token, "token_type": "bearer", "token": token}
            self.wfile.write(json.dumps(resp).encode())

        elif self.path == "/analyze/video":
            video_id = data.get("video_id", "")
            limit = data.get("comment_limit", 100)
            if not video_id:
                self.wfile.write(json.dumps({"error": "No video_id provided"}).encode())
                return
            try:
                result = run_analysis(video_id, comment_limit=limit)
                result["analysis_id"] = 1
                self.wfile.write(json.dumps(result).encode())
            except Exception as e:
                print(f"[ERROR] Analysis failed: {e}")
                self.wfile.write(json.dumps({"error": str(e)}).encode())
        else:
            self.wfile.write(json.dumps({"error": "Not found"}).encode())

    def _cors_headers(self, code):
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def log_message(self, fmt, *args):
        # Clean log output
        print(f"[SERVER] {args[0]}" if args else "")

# ===== MAIN =====
if __name__ == "__main__":
    print("=" * 55)
    print("  InsightX Real Analysis Server")
    print("  NO pip packages needed — 100% Python builtins")
    print("=" * 55)
    print(f"[OK] Starting on http://localhost:{PORT}")
    print("[OK] Go to YouTube, open extension, click Analyze!")
    print("[OK] Press Ctrl+C to stop.\n")

    server = HTTPServer(("127.0.0.1", PORT), InsightXHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[*] Server stopped.")
        server.server_close()
