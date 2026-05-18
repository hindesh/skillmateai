from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session as DBSession

from database import get_db
from models import Profile, TeacherRequest, Enrollment
from auth_utils import get_current_user
import uuid

router = APIRouter(tags=["teachers"])


class UpdateProfileBody(BaseModel):
    bio: Optional[str] = None
    expertise: Optional[List[str]] = None
    youtube_samples: Optional[List[dict]] = None  # [{"title": "...", "url": "..."}]
    price_per_hour: Optional[float] = None
    max_students: Optional[int] = None
    is_public: Optional[bool] = None


class SendRequestBody(BaseModel):
    teacher_id: str
    topic: str
    message: Optional[str] = None


class RespondRequestBody(BaseModel):
    status: str  # accepted | rejected


def _teacher_dict(t: Profile) -> dict:
    return {
        "id": t.id,
        "name": t.name,
        "email": t.email,
        "bio": t.bio,
        "expertise": t.expertise or [],
        "youtube_samples": t.youtube_samples or [],
        "price_per_hour": t.price_per_hour,
        "max_students": t.max_students,
        "is_public": t.is_public or False,
    }


def _request_dict(req: TeacherRequest, student: Optional[Profile], teacher: Optional[Profile]) -> dict:
    return {
        "id": req.id,
        "topic": req.topic,
        "message": req.message,
        "status": req.status,
        "student": {"id": student.id, "name": student.name, "email": student.email} if student else None,
        "teacher": {"id": teacher.id, "name": teacher.name} if teacher else None,
        "created_at": req.created_at.isoformat() if req.created_at else None,
    }


# ── Public teacher directory ──────────────────────────────────────────────────

@router.get("/teachers")
def list_teachers(
    query: Optional[str] = Query(None),
    db: DBSession = Depends(get_db),
):
    teachers = db.query(Profile).filter_by(role="teacher", is_public=True).all()
    if query:
        q = query.lower()
        teachers = [
            t for t in teachers
            if (t.expertise and any(q in e.lower() for e in t.expertise))
            or q in t.name.lower()
            or q in (t.bio or "").lower()
        ]
    return [_teacher_dict(t) for t in teachers]


@router.get("/teachers/{teacher_id}")
def get_teacher(teacher_id: str, db: DBSession = Depends(get_db)):
    t = db.query(Profile).filter_by(id=teacher_id, role="teacher").first()
    if not t:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return _teacher_dict(t)


# ── Teacher profile setup ─────────────────────────────────────────────────────

@router.put("/profile/teacher")
def update_teacher_profile(
    body: UpdateProfileBody,
    current_user: Profile = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can update teacher profiles")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return _teacher_dict(current_user)


@router.get("/profile/teacher/me")
def get_my_teacher_profile(
    current_user: Profile = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Not a teacher")
    return _teacher_dict(current_user)


# ── Student requests ──────────────────────────────────────────────────────────

@router.post("/requests")
def send_request(
    body: SendRequestBody,
    current_user: Profile = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can send requests")
    teacher = db.query(Profile).filter_by(id=body.teacher_id, role="teacher").first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    existing = db.query(Enrollment).filter_by(student_id=current_user.id, teacher_id=body.teacher_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled with this teacher")
    pending = db.query(TeacherRequest).filter_by(
        student_id=current_user.id, teacher_id=body.teacher_id, status="pending"
    ).first()
    if pending:
        raise HTTPException(status_code=400, detail="Request already sent")
    req = TeacherRequest(
        id=str(uuid.uuid4()),
        student_id=current_user.id,
        teacher_id=body.teacher_id,
        topic=body.topic,
        message=body.message,
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return _request_dict(req, current_user, teacher)


@router.get("/requests")
def get_requests(
    current_user: Profile = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    if current_user.role == "teacher":
        reqs = db.query(TeacherRequest).filter_by(teacher_id=current_user.id).order_by(
            TeacherRequest.created_at.desc()
        ).all()
    else:
        reqs = db.query(TeacherRequest).filter_by(student_id=current_user.id).order_by(
            TeacherRequest.created_at.desc()
        ).all()
    result = []
    for r in reqs:
        student = db.query(Profile).filter_by(id=r.student_id).first()
        teacher = db.query(Profile).filter_by(id=r.teacher_id).first()
        result.append(_request_dict(r, student, teacher))
    return result


@router.patch("/requests/{request_id}")
def respond_to_request(
    request_id: str,
    body: RespondRequestBody,
    current_user: Profile = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    req = db.query(TeacherRequest).filter_by(id=request_id).first()
    if not req or req.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if body.status not in ("accepted", "rejected"):
        raise HTTPException(status_code=400, detail="Status must be accepted or rejected")
    req.status = body.status
    if body.status == "accepted":
        existing = db.query(Enrollment).filter_by(
            student_id=req.student_id, teacher_id=req.teacher_id
        ).first()
        if not existing:
            db.add(Enrollment(
                id=str(uuid.uuid4()),
                student_id=req.student_id,
                teacher_id=req.teacher_id,
                request_id=req.id,
            ))
    db.commit()
    db.refresh(req)
    student = db.query(Profile).filter_by(id=req.student_id).first()
    teacher = db.query(Profile).filter_by(id=req.teacher_id).first()
    return _request_dict(req, student, teacher)


# ── Enrollments ───────────────────────────────────────────────────────────────

@router.get("/enrollments")
def get_enrollments(
    current_user: Profile = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    if current_user.role == "teacher":
        enrollments = db.query(Enrollment).filter_by(teacher_id=current_user.id).all()
        return [
            {
                "id": e.id,
                "student": {"id": s.id, "name": s.name, "email": s.email} if (s := db.query(Profile).filter_by(id=e.student_id).first()) else None,
                "created_at": e.created_at.isoformat(),
            }
            for e in enrollments
        ]
    else:
        enrollments = db.query(Enrollment).filter_by(student_id=current_user.id).all()
        return [
            {
                "id": e.id,
                "teacher": _teacher_dict(t) if (t := db.query(Profile).filter_by(id=e.teacher_id).first()) else None,
                "created_at": e.created_at.isoformat(),
            }
            for e in enrollments
        ]
