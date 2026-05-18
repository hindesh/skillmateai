from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession

from database import get_db
from models import Profile, QuizAttempt
from auth_utils import get_current_user
# from services.gemma import generate_progress_feedback  # re-enable when AI is active

router = APIRouter(prefix="/progress", tags=["progress"])


def _build_progress(student_id: str, db: DBSession, with_feedback: bool = True) -> dict:
    attempts = db.query(QuizAttempt).filter_by(student_id=student_id).order_by(QuizAttempt.created_at.desc()).all()

    chart_data = [
        {
            "date": a.created_at.strftime("%Y-%m-%d") if a.created_at else "",
            "topic": a.topic,
            "score": a.score,
            "total": a.total,
            "percentage": round((a.score / a.total) * 100) if a.total else 0,
        }
        for a in attempts
    ]

    feedback = None
    # AI feedback disabled — will call generate_progress_feedback when Gemma 4 is active
    # if with_feedback and len(attempts) >= 2:
    #     try: feedback = generate_progress_feedback(chart_data[:10])
    #     except Exception: pass

    return {"chart_data": chart_data, "feedback": feedback, "total_attempts": len(attempts)}


@router.get("")
def my_progress(
    current_user: Profile = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    return _build_progress(current_user.id, db)


@router.get("/student/{student_id}")
def student_progress(
    student_id: str,
    current_user: Profile = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Teachers only")
    return _build_progress(student_id, db, with_feedback=False)


@router.get("/profiles/search")
def search_profiles(
    email: str,
    current_user: Profile = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Teachers only")
    profiles = db.query(Profile).filter(
        Profile.email.ilike(f"%{email}%"),
        Profile.role == "student",
    ).limit(10).all()
    return [{"id": p.id, "name": p.name, "email": p.email, "role": p.role} for p in profiles]
