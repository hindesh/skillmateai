import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from database import engine, Base
from routers import auth_router, sessions, questions, quizzes, progress
from routers.teachers import router as teachers_router

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="SkillMateAI API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(sessions.router)
app.include_router(questions.router)
app.include_router(quizzes.router)
app.include_router(progress.router)
app.include_router(teachers_router)


@app.get("/health")
def health():
    model = os.getenv("GEMMA_MODEL", "gemini-2.5-flash")
    return {"status": "ok", "version": "2.0.0", "ai_model": model}
