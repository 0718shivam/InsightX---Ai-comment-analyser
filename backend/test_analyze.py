import urllib.request
import urllib.error
import json

def get_token():
    # Attempt to signup and get a token
    try:
        req = urllib.request.Request(
            "http://127.0.0.1:8000/auth/signup", 
            data=json.dumps({"email": "test_user@example.com", "password": "password123"}).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req) as res:
            data = json.loads(res.read().decode('utf-8'))
            return data["token"]
    except Exception as e:
        # If already exists, just login
        try:
            req = urllib.request.Request(
                "http://127.0.0.1:8000/auth/login", 
                data=json.dumps({"email": "test_user@example.com", "password": "password123"}).encode('utf-8'),
                headers={'Content-Type': 'application/json'}
            )
            with urllib.request.urlopen(req) as res:
                data = json.loads(res.read().decode('utf-8'))
                return data["token"]
        except Exception as e2:
            print(f"Auth failed: {e2}")
            return None

def test_analyze():
    token = get_token()
    if not token:
        print("Could not get auth token. Stopping test.")
        return

    print(f"Using token: {token[:10]}...")
    
    req = urllib.request.Request(
        "http://127.0.0.1:8000/analyze/video", 
        data=json.dumps({"video_id": "dQw4w9WgXcQ", "comment_limit": 10}).encode('utf-8'),
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {token}'
        }
    )
    try:
        with urllib.request.urlopen(req) as res:
            print("Status:", res.status)
            resp_data = json.loads(res.read().decode('utf-8'))
            print("Video Title:", resp_data.get("video_title"))
            print("Summary Snippet:", resp_data.get("summary")[:100], "...")
    except urllib.error.HTTPError as e:
        print("Error HTTP:", e.code, e.read().decode('utf-8'))
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    test_analyze()
