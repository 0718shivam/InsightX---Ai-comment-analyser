"""
InsightX Backend Starter
Run this file to start the backend: python start.py
It will automatically kill any old servers and start fresh.
"""
import subprocess
import sys
import os
import socket
import time

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0

def kill_port(port):
    """Kill whatever is using the port"""
    try:
        result = subprocess.run(
            f'netstat -ano | findstr :{port}',
            capture_output=True, text=True, shell=True
        )
        for line in result.stdout.strip().split('\n'):
            parts = line.split()
            if parts and parts[-1].isdigit():
                pid = parts[-1]
                subprocess.run(f'taskkill /F /PID {pid}', shell=True, capture_output=True)
    except:
        pass

if __name__ == "__main__":
    PORT = 8000
    
    print("=" * 50)
    print("  InsightX Backend Starter")
    print("=" * 50)
    
    # Step 1: Kill anything on port 8000
    if is_port_in_use(PORT):
        print(f"[!] Port {PORT} is in use. Killing old process...")
        kill_port(PORT)
        time.sleep(1)
    
    if is_port_in_use(PORT):
        print(f"[ERROR] Port {PORT} is STILL in use! Close all terminals and try again.")
        sys.exit(1)
    
    print(f"[OK] Port {PORT} is free.")
    
    # Step 2: Start uvicorn
    print(f"[*] Starting InsightX backend on http://localhost:{PORT}")
    print("[*] Press Ctrl+C to stop the server.\n")
    
    try:
        import uvicorn
        uvicorn.run("main:app", host="127.0.0.1", port=PORT, reload=True)
    except ImportError:
        print("[ERROR] uvicorn is not installed. Run: pip install uvicorn fastapi")
        sys.exit(1)
