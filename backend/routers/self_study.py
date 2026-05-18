from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session as DBSession

from database import get_db
from models import Profile, SelfStudyItem, Question as QuestionModel
from auth_utils import get_current_user
from services.gemma import generate_self_study_questions
import uuid

router = APIRouter(prefix="/self-study", tags=["self-study"])


class SelfStudyRequest(BaseModel):
    source_text: str


def _question_dict(q: QuestionModel) -> dict:
    return {
        "id": q.id,
        "content": q.content,
        "options": q.options,
        "correct_answer": q.correct_answer,
        "explanation": q.explanation,
        "topic": q.topic,
        "difficulty": q.difficulty,
        "status": q.status,
    }


@router.post("")
def create_self_study(
    body: SelfStudyRequest,
    current_user: Profile = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    if len(body.source_text.strip()) < 20:
        raise HTTPException(status_code=400, detail="Text too short — paste at least a sentence or two")

    result = generate_self_study_questions(body.source_text)

    item = SelfStudyItem(
        id=str(uuid.uuid4()),
        student_id=current_user.id,
        source_text=body.source_text,
        topic=result["topic"],
    )
    db.add(item)
    db.commit()

    questions = []
    for q in result.get("questions", []):
        questions.append(QuestionModel(
            id=str(uuid.uuid4()),
            self_study_item_id=item.id,
            student_id=current_user.id,
            content=q["content"],
            options=q["options"],
            correct_answer=q["correct_answer"],
            explanation=q["explanation"],
            topic=q.get("topic", result["topic"]),
            difficulty=q.get("difficulty", "medium"),
            status="approved",
            source="self_study",
        ))
    if questions:
        db.add_all(questions)
        db.commit()

    return {"id": item.id, "topic": result["topic"], "questions_generated": len(questions)}


@router.get("")
def list_self_study(
    current_user: Profile = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    items = db.query(SelfStudyItem).filter_by(student_id=current_user.id).order_by(SelfStudyItem.created_at.desc()).all()
    result = []
    for item in items:
        questions = db.query(QuestionModel).filter_by(self_study_item_id=item.id).all()
        result.append({
            "id": item.id,
            "topic": item.topic,
            "source_text": item.source_text,
            "created_at": item.created_at.isoformat() if item.created_at else None,
            "questions": [{"id": q.id, "status": q.status} for q in questions],
        })
    return result


@router.get("/{item_id}")
def get_self_study(
    item_id: str,
    current_user: Profile = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    item = db.query(SelfStudyItem).filter_by(id=item_id, student_id=current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Self-study item not found")
    questions = db.query(QuestionModel).filter_by(self_study_item_id=item_id).all()
    return {
        "id": item.id,
        "topic": item.topic,
        "source_text": item.source_text,
        "created_at": item.created_at.isoformat() if item.created_at else None,
        "questions": [_question_dict(q) for q in questions],
    }
