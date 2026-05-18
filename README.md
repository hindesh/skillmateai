# SkillMateAI — Local Development Setup

## Prerequisites
- Python 3.12+
- Node.js 20+
- PostgreSQL running locally
- A Google AI API key with Gemma 4 access

---

## 1. PostgreSQL Setup

```bash
# macOS
brew install postgresql@15
brew services start postgresql@15
createdb skillmateai
```

Tables are created automatically when the backend starts — no schema file needed.

---

## 2. Backend

```bash
cd backend
cp .env.example .env
# Fill in DATABASE_URL, GOOGLE_API_KEY, SECRET_KEY
```

Install dependencies:
```bash
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Start the server:
```bash
uvicorn main:app --reload --port 8000
```

Verify: http://localhost:8000/health → `{"status":"ok","model":"gemma-4-27b-it"}`

Tables are created on first run automatically.

---

## 3. Frontend

```bash
cd frontend
cp .env.local.example .env.local
# Only NEXT_PUBLIC_API_URL is needed (defaults to http://localhost:8000)
```

Install dependencies:
```bash
npm install
```

Start the dev server:
```bash
npm run dev
```

Open: http://localhost:3000

---

## Environment Variables

### Backend `.env`
| Variable | Description |
|---|---|
| `DATABASE_URL` | `postgresql://localhost/skillmateai` |
| `GOOGLE_API_KEY` | Google AI API key |
| `GEMMA_MODEL` | Model ID (default: `gemma-4-27b-it`) |
| `SECRET_KEY` | Random secret for JWT signing |
| `FRONTEND_URL` | `http://localhost:3000` |

### Frontend `.env.local`
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` |

---

## Architecture

```
Browser (Next.js — localhost:3000)
    │
    │  REST: x-user-id header + JSON body
    │  Supabase Realtime (WebSocket) for live chat
    ▼
FastAPI (localhost:8000)
    │                    │
    │ google-generativeai │ supabase-py (service role)
    ▼                    ▼
Gemma 4               Supabase
(Google AI API)       (Postgres + Auth + Realtime)
```

## User Flows

**Teacher:** Sign up (role=teacher) → Create session → Invite student by email → Chat → "Analyse & Generate Quiz" → Approve questions → View student progress

**Student:** Sign up (role=student) → Join session → Chat → Take quiz → View progress chart + AI feedback

**Self-Study:** Sign in → /self-study → Paste notes → Generate 5 questions → Practice → Track progress
