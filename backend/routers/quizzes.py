from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session as DBSession

from database import get_db
from models import Profile, Question as QuestionModel, QuizAttempt
from auth_utils import get_current_user
import uuid

router = APIRouter(prefix="/quizzes", tags=["quizzes"])


class SubmitQuizRequest(BaseModel):
    session_id: Optional[str] = None
    topic: str
    question_ids: list[str]
    answers: dict[str, str]


@router.post("/submit")
def submit_quiz(
    body: SubmitQuizRequest,
    current_user: Profile = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    questions = db.query(QuestionModel).filter(QuestionModel.id.in_(body.question_ids)).all()
    if not questions:
        raise HTTPException(status_code=404, detail="Questions not found")

    q_map = {q.id: q for q in questions}
    score = 0
    results = []

    for qid in body.question_ids:
        q = q_map.get(qid)
        if not q:
            continue
        selected = body.answers.get(qid, "")
        is_correct = selected == q.correct_answer
        if is_correct:
            score += 1
        results.append({
            "question_id": qid,
            "content": q.content,
            "options": q.options,
            "selected": selected,
            "correct_answer": q.correct_answer,
            "is_correct": is_correct,
            "explanation": q.explanation,
            "topic": q.topic,
        })

    total = len(body.question_ids)
    attempt = QuizAttempt(
        id=str(uuid.uuid4()),
        student_id=current_user.id,
        session_id=body.session_id,
        topic=body.topic,
        questions=body.question_ids,
        answers=body.answers,
        score=score,
        total=total,
    )
    db.add(attempt)
    db.commit()

    return {
        "score": score,
        "total": total,
        "percentage": round((score / total) * 100) if total else 0,
        "results": results,
    }


@router.get("/history")
def quiz_history(
    current_user: Profile = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    attempts = db.query(QuizAttempt).filter_by(student_id=current_user.id).order_by(QuizAttempt.created_at.desc()).all()
    return [
        {
            "id": a.id,
            "topic": a.topic,
            "score": a.score,
            "total": a.total,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        }
        for a in attempts
    ]
