import requests

def test_auth():
    print("Testing signup...")
    try:
        res = requests.post("http://127.0.0.1:8000/auth/signup", json={"email": "test2@test.com", "password": "password123"})
        print("Signup Response:", res.status_code, res.text)
    except Exception as e:
        print("Signup failed:", e)

    print("\nTesting login...")
    try:
        res = requests.post("http://127.0.0.1:8000/auth/login", json={"email": "test2@test.com", "password": "password123"})
        print("Login Response:", res.status_code, res.text)
    except Exception as e:
        print("Login failed:", e)

if __name__ == "__main__":
    test_auth()
