import json
import sqlite3
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import urllib.request

YOUTUBE_API_KEY = "dummy_key" # The extension doesn't validate this here 

def init_mock_db():
    conn = sqlite3.connect("insightx_mock.db", check_same_thread=False)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL
        )
    ''')
    conn.commit()
    return conn

conn = init_mock_db()

class MockInsightXHandler(BaseHTTPRequestHandler):
    
    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS, POST')
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Authorization")
        self.end_headers()

    def do_POST(self):
        parsed_path = urlparse(self.path)
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS, POST')
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Authorization")
        self.end_headers()

        if parsed_path.path == "/auth/login":
            # Just let anyone in for the mock
            response = {"access_token": "mock_token", "token_type": "bearer", "token": "mock_token"}
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        elif parsed_path.path == "/auth/signup":
            response = {"access_token": "mock_token", "token_type": "bearer", "token": "mock_token"}
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        elif parsed_path.path == "/analyze/video":
            video_id = data.get("video_id", "Unknown")
            # Return our mock analysis payload
            analysis_data = {
                "video_title": f"YouTube Video {video_id}",
                "channel_name": "InsightX Test Channel",
                "summary": "This video received many comments with a mostly positive reception (75% positive). Viewers frequently discussed: amazing, tutorial, quality. The editing style was especially appreciated. Quick Win: Check microphone settings.",
                "sentiment": {
                    "positive_percent": 75, "neutral_percent": 15, "negative_percent": 10,
                    "positive_count": 375, "neutral_count": 75, "negative_count": 50
                },
                "categories": { "praise": 200, "questions": 100, "complaints": 30, "suggestions": 120, "general": 50 },
                "keywords": [
                    {"keyword": "amazing", "score": 0.95}, {"keyword": "tutorial", "score": 0.85},
                    {"keyword": "quality", "score": 0.75}, {"keyword": "audio", "score": 0.65}
                ],
                "praise_breakdown": {
                    "editing_style": {"count": 150, "examples": ["The editing in this one is top tier!"]},
                    "explanation": {"count": 50, "examples": ["Very clear explanation, thanks."]}
                },
                "complaints_breakdown": {
                    "audio_quality": {"count": 25, "examples": ["Audio is a bit low."], "solution": "Normalize audio levels in post-processing."}
                },
                "top_questions": [
                    {"question": "What microphone do you use?", "frequency": 45, "opportunity": "Add affiliate link in description."}
                ],
                "content_demand": {
                    "high_demand": { "part_2": {"request_count": 30, "estimated_views": 10000} }
                },
                "recommended_actions": {
                    "urgent": [{"action": "Check microphone settings", "impact": "High - 25 users complained about audio"}],
                    "next_video_ideas": [{"topic": "Part 2 / Advanced Tutorial", "demand": "Very High"}]
                }
            }
            self.wfile.write(json.dumps(analysis_data).encode('utf-8'))
        else:
            self.wfile.write(json.dumps({"error": "Not found"}).encode('utf-8'))

def run(server_class=HTTPServer, handler_class=MockInsightXHandler, port=8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f"Starting mock InsightX backend without pip on port {port}...")
    httpd.serve_forever()

if __name__ == '__main__':
    run()
