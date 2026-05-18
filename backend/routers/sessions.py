import json
import os
import random
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session as DBSession

from database import get_db
from models import Profile, Session as SessionModel, Question as QuestionModel, Enrollment
from auth_utils import get_current_user
from services.gemma import generate_questions_from_transcript

_TRANSCRIPT_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "test_transcript.txt")

router = APIRouter(prefix="/sessions", tags=["sessions"])

_QUESTIONS_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "newton_laws_questions.json")


def _load_static_questions() -> list[dict]:
    with open(_QUESTIONS_FILE, "r") as f:
        return json.load(f)


class CreateSessionBody(BaseModel):
    topic: str
    student_id: Optional[str] = None
    enrollment_id: Optional[str] = None
    scheduled_at: Optional[str] = None  # ISO string


class UpdateSessionBody(BaseModel):
    recording_link: Optional[str] = None
    transcript: Optional[str] = None
    session_notes: Optional[str] = None
    scheduled_at: Optional[str] = None


def _session_dict(s: SessionModel, other: Optional[Profile] = None) -> dict:
    return {
        "id": s.id,
        "teacher_id": s.teacher_id,
        "student_id": s.student_id,
        "enrollment_id": s.enrollment_id,
        "topic": s.topic,
        "status": s.status,
        "scheduled_at": s.scheduled_at.isoformat() if s.scheduled_at else None,
        "recording_link": s.recording_link,
        "transcript": s.transcript,
        "session_notes": s.session_notes,
        "understanding_score": s.understanding_score,
        "weak_topics": s.weak_topics,
        "created_at": s.created_at.isoformat() if s.created_at else None,
        "ended_at": s.ended_at.isoformat() if s.ended_at else None,
        "profiles": {"name": other.name, "email": other.email} if other else None,
    }


def _get_session_or_403(session_id: str, user: Profile, db: DBSession) -> SessionModel:
    s = db.query(SessionModel).filter_by(id=session_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Session not found")
    if s.teacher_id != user.id and s.student_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return s


@router.post("")
def create_session(
    body: CreateSessionBody,
    current_user: Profile = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can create sessions")

    scheduled_at = None
    if body.scheduled_at:
        try:
            scheduled_at = datetime.fromisoformat(body.scheduled_at)
        except ValueError:
            pass

    s = SessionModel(
        id=str(uuid.uuid4()),
        teacher_id=current_user.id,
        student_id=body.student_id,
        enrollment_id=body.enrollment_id,
        topic=body.topic,
        status="scheduled",
        scheduled_at=scheduled_at,
    )
    db.add(s)
    db.commit()
    db.refresh(s)

    other = db.query(Profile).filter_by(id=body.student_id).first() if body.student_id else None
    return _session_dict(s, other)


@router.get("")
def list_sessions(
    current_user: Profile = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    if current_user.role == "teacher":
        sessions = db.query(SessionModel).filter_by(teacher_id=current_user.id).order_by(
            SessionModel.created_at.desc()
        ).all()
        result = []
        for s in sessions:
            other = db.query(Profile).filter_by(id=s.student_id).first() if s.student_id else None
            result.append(_session_dict(s, other))
    else:
        sessions = db.query(SessionModel).filter_by(student_id=current_user.id).order_by(
            SessionModel.created_at.desc()
        ).all()
        result = []
        for s in sessions:
            other = db.query(Profile).filter_by(id=s.teacher_id).first()
            result.append(_session_dict(s, other))
    return result


@router.get("/{session_id}")
def get_session(
    session_id: str,
    current_user: Profile = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    s = _get_session_or_403(session_id, current_user, db)
    if current_user.role == "teacher":
        other = db.query(Profile).filter_by(id=s.student_id).first() if s.student_id else None
    else:
        other = db.query(Profile).filter_by(id=s.teacher_id).first()
    return _session_dict(s, other)


@router.patch("/{session_id}")
def update_session(
    session_id: str,
    body: UpdateSessionBody,
    current_user: Profile = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    s = db.query(SessionModel).filter_by(id=session_id).first()
    if not s or s.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the session teacher can update this")

    if body.recording_link is not None:
        s.recording_link = body.recording_link
    if body.transcript is not None:
        s.transcript = body.transcript
    if body.session_notes is not None:
        s.session_notes = body.session_notes
    if body.scheduled_at is not None:
        try:
            s.scheduled_at = datetime.fromisoformat(body.scheduled_at)
        except ValueError:
            pass

    db.commit()
    db.refresh(s)
    other = db.query(Profile).filter_by(id=s.student_id).first() if s.student_id else None
    return _session_dict(s, other)


@router.patch("/{session_id}/complete")
def complete_session(
    session_id: str,
    current_user: Profile = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    s = db.query(SessionModel).filter_by(id=session_id).first()
    if not s or s.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the session teacher can complete it")
    s.status = "completed"
    s.ended_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(s)
    return _session_dict(s)


@router.post("/{session_id}/generate")
def generate_questions(
    session_id: str,
    current_user: Profile = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Load questions from the static JSON bank and assign them to this session."""
    s = db.query(SessionModel).filter_by(id=session_id).first()
    if not s or s.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the session teacher can generate questions")

    # Remove any previously generated questions for this session
    db.query(QuestionModel).filter_by(session_id=session_id).delete()

    all_questions = _load_static_questions()
    selected = random.sample(all_questions, min(5, len(all_questions)))

    questions_to_add = []
    for q in selected:
        questions_to_add.append(QuestionModel(
            id=str(uuid.uuid4()),
            session_id=session_id,
            student_id=s.student_id,
            content=q["content"],
            options=q["options"],
            correct_answer=q["correct_answer"],
            explanation=q["explanation"],
            topic=q["topic"],
            difficulty=q.get("difficulty", "medium"),
            status="approved",
            source="session",
        ))

    db.add_all(questions_to_add)
    s.status = "analysed"
    s.ended_at = datetime.now(timezone.utc)
    db.commit()

    return {
        "questions_generated": len(questions_to_add),
        "topic": s.topic,
        "session_id": session_id,
    }


class GenerateFromTranscriptBody(BaseModel):
    transcript: Optional[str] = None  # if omitted, reads from test_transcript.txt


@router.post("/{session_id}/generate-from-transcript")
def generate_from_transcript(
    session_id: str,
    body: GenerateFromTranscriptBody,
    current_user: Profile = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Generate questions from a transcript using the local Gemma model via Ollama."""
    s = db.query(SessionModel).filter_by(id=session_id).first()
    if not s or s.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the session teacher can generate questions")

    # Use provided transcript or fall back to test_transcript.txt
    if body.transcript and body.transcript.strip():
        transcript = body.transcript
    else:
        try:
            with open(_TRANSCRIPT_FILE, "r") as f:
                transcript = f.read()
            # Strip comment lines
            lines = [l for l in transcript.splitlines() if not l.strip().startswith("#")]
            transcript = "\n".join(lines).strip()
        except FileNotFoundError:
            raise HTTPException(status_code=400, detail="No transcript provided and test_transcript.txt not found")

    if not transcript:
        raise HTTPException(status_code=400, detail="Transcript is empty — paste content into test_transcript.txt")

    try:
        questions = generate_questions_from_transcript(transcript, topic=s.topic)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"AI generation failed: {e}")

    # Remove old questions and save new ones
    db.query(QuestionModel).filter_by(session_id=session_id).delete()

    to_add = []
    for q in questions:
        to_add.append(QuestionModel(
            id=str(uuid.uuid4()),
            session_id=session_id,
            student_id=s.student_id,
            content=q["content"],
            options=q["options"],
            correct_answer=q["correct_answer"],
            explanation=q["explanation"],
            topic=q["topic"],
            difficulty=q.get("difficulty", "medium"),
            status="approved",
            source="transcript",
        ))

    db.add_all(to_add)
    s.status = "analysed"
    s.ended_at = datetime.now(timezone.utc)
    db.commit()

    return {
        "questions_generated": len(to_add),
        "topic": s.topic,
        "session_id": session_id,
        "source": "local_ai",
    }
