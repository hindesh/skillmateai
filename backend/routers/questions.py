from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Literal
from sqlalchemy.orm import Session as DBSession

from database import get_db
from models import Profile, Session as SessionModel, Question as QuestionModel
from auth_utils import get_current_user

router = APIRouter(prefix="/questions", tags=["questions"])


class ApproveRequest(BaseModel):
    status: Literal["approved", "rejected"]


def _question_dict(q: QuestionModel) -> dict:
    return {
        "id": q.id,
        "session_id": q.session_id,
        "student_id": q.student_id,
        "content": q.content,
        "options": q.options,
        "correct_answer": q.correct_answer,
        "explanation": q.explanation,
        "topic": q.topic,
        "difficulty": q.difficulty,
        "status": q.status,
        "source": q.source,
        "created_at": q.created_at.isoformat() if q.created_at else None,
    }


@router.get("/session/{session_id}")
def get_session_questions(
    session_id: str,
    current_user: Profile = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    s = db.query(SessionModel).filter_by(id=session_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Session not found")

    if current_user.role == "teacher":
        if s.teacher_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        questions = db.query(QuestionModel).filter_by(session_id=session_id).order_by(QuestionModel.created_at).all()
    else:
        if s.student_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        questions = db.query(QuestionModel).filter_by(session_id=session_id, status="approved").order_by(QuestionModel.created_at).all()

    return [_question_dict(q) for q in questions]


@router.patch("/{question_id}/approve")
def approve_question(
    question_id: str,
    body: ApproveRequest,
    current_user: Profile = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    q = db.query(QuestionModel).filter_by(id=question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    if q.session_id:
        s = db.query(SessionModel).filter_by(id=q.session_id).first()
        if not s or s.teacher_id != current_user.id:
            raise HTTPException(status_code=403, detail="Only the session teacher can approve questions")
    q.status = body.status
    db.commit()
    db.refresh(q)
    return _question_dict(q)
