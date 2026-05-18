from sqlalchemy import Column, String, Integer, Float, Text, DateTime, JSON, Boolean, ForeignKey
from database import Base
from datetime import datetime, timezone
import uuid


def _uuid():
    return str(uuid.uuid4())


def _now():
    return datetime.now(timezone.utc)


class Profile(Base):
    __tablename__ = "profiles"
    id = Column(String, primary_key=True, default=_uuid)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # teacher | student
    grade_level = Column(String, nullable=True)  # student: e.g. "Grade 10", "College Freshman"
    # Teacher profile fields
    bio = Column(Text, nullable=True)
    expertise = Column(JSON, nullable=True)       # ["Physics", "Mathematics"]
    youtube_samples = Column(JSON, nullable=True)  # [{"title": "...", "url": "..."}]
    price_per_hour = Column(Float, nullable=True)
    max_students = Column(Integer, nullable=True)
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=_now)


class TeacherRequest(Base):
    __tablename__ = "teacher_requests"
    id = Column(String, primary_key=True, default=_uuid)
    student_id = Column(String, ForeignKey("profiles.id"), nullable=False)
    teacher_id = Column(String, ForeignKey("profiles.id"), nullable=False)
    topic = Column(String, nullable=False)
    message = Column(Text, nullable=True)
    status = Column(String, default="pending")  # pending | accepted | rejected
    created_at = Column(DateTime(timezone=True), default=_now)


class Enrollment(Base):
    __tablename__ = "enrollments"
    id = Column(String, primary_key=True, default=_uuid)
    student_id = Column(String, ForeignKey("profiles.id"), nullable=False)
    teacher_id = Column(String, ForeignKey("profiles.id"), nullable=False)
    request_id = Column(String, ForeignKey("teacher_requests.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=_now)


class Session(Base):
    __tablename__ = "sessions"
    id = Column(String, primary_key=True, default=_uuid)
    teacher_id = Column(String, ForeignKey("profiles.id"), nullable=False)
    student_id = Column(String, ForeignKey("profiles.id"), nullable=True)
    enrollment_id = Column(String, ForeignKey("enrollments.id"), nullable=True)
    topic = Column(String, nullable=False)
    status = Column(String, nullable=False, default="scheduled")  # scheduled | completed | analysed
    scheduled_at = Column(DateTime(timezone=True), nullable=True)
    recording_link = Column(String, nullable=True)
    transcript = Column(Text, nullable=True)
    session_notes = Column(Text, nullable=True)
    understanding_score = Column(Integer, nullable=True)
    weak_topics = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=_now)
    ended_at = Column(DateTime(timezone=True), nullable=True)


class Question(Base):
    __tablename__ = "questions"
    id = Column(String, primary_key=True, default=_uuid)
    session_id = Column(String, ForeignKey("sessions.id"), nullable=True)
    student_id = Column(String, ForeignKey("profiles.id"), nullable=True)
    content = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)        # ["A. ...", "B. ...", ...]
    correct_answer = Column(String, nullable=False)
    explanation = Column(Text, nullable=False)
    topic = Column(String, nullable=False)
    difficulty = Column(String, nullable=False, default="medium")
    status = Column(String, nullable=False, default="approved")
    source = Column(String, nullable=False, default="session")
    created_at = Column(DateTime(timezone=True), default=_now)


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"
    id = Column(String, primary_key=True, default=_uuid)
    student_id = Column(String, ForeignKey("profiles.id"), nullable=False)
    session_id = Column(String, ForeignKey("sessions.id"), nullable=True)
    topic = Column(String, nullable=False)
    questions = Column(JSON, nullable=False)  # [question_id, ...]
    answers = Column(JSON, nullable=False)    # {question_id: "A"}
    score = Column(Integer, nullable=False)
    total = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), default=_now)
