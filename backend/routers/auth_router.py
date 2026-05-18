from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session as DBSession
from database import get_db
from models import Profile
from auth_utils import hash_password, verify_password, create_token, get_current_user
import uuid

router = APIRouter(prefix="/auth", tags=["auth"])


class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str
    grade_level: str | None = None


class SigninRequest(BaseModel):
    email: str
    password: str


def _profile_response(profile: Profile, token: str) -> dict:
    return {
        "token": token,
        "user": {
            "id": profile.id,
            "name": profile.name,
            "email": profile.email,
            "role": profile.role,
        },
    }


@router.post("/signup")
def signup(body: SignupRequest, db: DBSession = Depends(get_db)):
    if body.role not in ("teacher", "student"):
        raise HTTPException(status_code=400, detail="Role must be 'teacher' or 'student'")
    if db.query(Profile).filter_by(email=body.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    profile = Profile(
        id=str(uuid.uuid4()),
        email=body.email,
        password_hash=hash_password(body.password),
        name=body.name,
        role=body.role,
        grade_level=body.grade_level if body.role == "student" else None,
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    token = create_token(profile.id, profile.name, profile.email, profile.role, profile.grade_level)
    return _profile_response(profile, token)


@router.post("/signin")
def signin(body: SigninRequest, db: DBSession = Depends(get_db)):
    profile = db.query(Profile).filter_by(email=body.email).first()
    if not profile or not verify_password(body.password, profile.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token(profile.id, profile.name, profile.email, profile.role, profile.grade_level)
    return _profile_response(profile, token)


@router.get("/me")
def me(current_user: Profile = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
    }
