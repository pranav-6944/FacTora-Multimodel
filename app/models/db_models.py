from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime,
    ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.session import Base


class User(Base):
    """Authenticated user entity with strict data isolation."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    role = Column(String(50), default="user", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    records = relationship("AnalysisRecord", back_populates="user", cascade="all, delete-orphan")
    feedback = relationship("UserFeedback", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<User id={self.id} username={self.username} email={self.email}>"


class AnalysisRecord(Base):
    """
    Multimodal verification record across Text, Image, Video, and Audio.
    Strictly isolated per user via user_id.
    """
    __tablename__ = "analysis_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    modality = Column(String(20), index=True, nullable=False)  # TEXT, IMAGE, VIDEO, AUDIO
    
    # Input metadata
    title = Column(String(500), nullable=True)
    content_preview = Column(Text, nullable=True)
    file_path = Column(String(500), nullable=True)
    file_hash = Column(String(64), index=True, nullable=True)  # SHA-256
    
    # Core detection output
    verdict = Column(String(20), index=True, nullable=False)   # REAL, FAKE, UNCERTAIN
    confidence_score = Column(Float, nullable=False)           # 0.0 to 100.0%
    reasoning = Column(Text, nullable=False)                   # "Why and what is it"
    
    # Forensic & cross-check payloads
    detailed_analysis = Column(JSON, nullable=True)            # Modality-specific forensic indicators
    google_crosscheck = Column(JSON, nullable=True)            # Corroborating sources & claims
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True, nullable=False)

    # Relationships
    user = relationship("User", back_populates="records")
    feedback = relationship("UserFeedback", back_populates="record", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<AnalysisRecord id={self.id} user_id={self.user_id} modality={self.modality} verdict={self.verdict} score={self.confidence_score}>"


class UserFeedback(Base):
    """User correction or feedback on a specific verification verdict."""
    __tablename__ = "user_feedback"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    record_id = Column(Integer, ForeignKey("analysis_records.id", ondelete="CASCADE"), index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    rating = Column(Integer, nullable=True)                    # 1-5 rating
    feedback_text = Column(Text, nullable=True)
    suggested_verdict = Column(String(20), nullable=True)      # REAL, FAKE
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    record = relationship("AnalysisRecord", back_populates="feedback")
    user = relationship("User", back_populates="feedback")

    def __repr__(self) -> str:
        return f"<UserFeedback id={self.id} record_id={self.record_id} user_id={self.user_id}>"
