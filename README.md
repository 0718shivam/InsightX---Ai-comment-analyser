# InsightX

InsightX is an AI-powered YouTube comment intelligence platform.
It helps creators understand audience sentiment, recurring topics, engagement patterns, and actionable next steps from real comment data.

## What this project includes

- A Chrome extension to analyze the current YouTube video directly from the browser.
- A FastAPI backend for auth, comment fetching, NLP processing, and data APIs.
- A React dashboard for visual analytics, saved history, and creator-facing insights.
- A SaaS-style landing page at `/home` and dashboard at `/dashboard`.

## Core features

- Sentiment analysis (positive/neutral/negative) with clear chart explanations.
- Topic/theme detection from real comments.
- Engagement insights (likes/replies distributions).
- Top comments by likes, replies, positive sentiment, and negative sentiment.
- AI summary with structured insights and creator actions.
- Lightweight saved history (latest analyzed videos).
- Dark/light mode support in extension and dashboard.

---

## Complete tech stack

### Frontend (Dashboard)
- React 19
- React Router
- Tailwind CSS v4
- Recharts
- Axios
- Lucide React icons
- Vite
- ESLint

### Backend
- Python 3.12+
- FastAPI
- Uvicorn
- Pydantic + pydantic-settings
- httpx
- python-jose (JWT auth)
- passlib + bcrypt (password hashing)
- python-dotenv
- SQLite (local database)
- pytest + pytest-asyncio

### Browser Extension
- Chrome Extension Manifest V3
- Vanilla JavaScript, HTML, CSS
- Chrome APIs: `storage`, `tabs`, `activeTab`, `scripting`
- Content script + background service worker

### Integrations
- YouTube Data API (video metadata + comments)

---

## Latest project structure

```text
insightx-project/
├── backend/
│   ├── database/                # DB setup and schema utilities
│   ├── routes/                  # auth.py, analyze.py, dashboard.py
│   ├── services/                # YouTube API + NLP pipeline logic
│   ├── utils/                   # auth + helper utilities
│   ├── main.py                  # FastAPI app entry
│   ├── start.py                 # local backend starter (port handling)
│   ├── requirements.txt
│   └── insightx.db              # SQLite DB (generated at runtime)
├── dashboard/
│   ├── src/
│   │   ├── components/          # Sidebar, Topbar, dashboard sections
│   │   ├── context/             # Theme context
│   │   ├── data/                # demo/mock videos
│   │   ├── pages/               # HomePage, Dashboard, Login, etc.
│   │   ├── App.jsx              # routes: /, /home, /dashboard, /login
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── extension/
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.css
│   │   └── popup.js
│   ├── content.js
│   ├── background.js
│   └── manifest.json
└── README.md
```

---

## Local setup (easy steps)

## 1) Backend setup

```bash
cd backend
python -m venv venv
```

Activate environment:
- Windows (PowerShell):
```bash
venv\Scripts\activate
```
- macOS/Linux:
```bash
source venv/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Start backend:
```bash
python start.py
```

Backend runs at: `http://127.0.0.1:8000`

---

## 2) Dashboard setup

```bash
cd dashboard
npm install
npm run dev
```

Dashboard runs at: `http://localhost:5173`

Routes:
- `/home` -> Landing page
- `/dashboard` -> Analytics dashboard
- `/login` -> Auth page

---

## 3) Chrome extension setup

1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `extension` folder
5. Open a YouTube video and use InsightX popup

---

## Configuration notes

- Backend config file: `backend/config.py`
- Important env/config values:
  - `YOUTUBE_API_KEY`
  - `JWT_SECRET_KEY`
- CORS is configured for local dashboard + extension development.

---

## Troubleshooting

### Port 8000 is still in use
Run in PowerShell:
```bash
$pid8000 = (Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty OwningProcess)
if ($pid8000) { taskkill /F /T /PID $pid8000 }
python start.py
```

### Backend starts but extension fails
- Confirm backend is running at `http://127.0.0.1:8000`
- Confirm dashboard is running at `http://localhost:5173`
- Reload extension in `chrome://extensions/`

### Login/token issues
- Clear extension storage and browser local storage
- Re-login from extension or dashboard

---

## Quick summary

InsightX gives creators a single workflow:
1) open video,
2) analyze real comments with AI,
3) view clear, actionable insights in a clean dashboard.
