from datetime import datetime
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, EmailStr, Field


# =====================================================================
# USER & AUTHENTICATION SCHEMAS
# =====================================================================

class UserSignupRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Unique username")
    email: EmailStr = Field(..., description="Valid user email address")
    password: str = Field(..., min_length=6, max_length=128, description="User password")


class UserLoginRequest(BaseModel):
    username_or_email: str = Field(..., description="Username or email address")
    password: str = Field(..., description="Account password")


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# =====================================================================
# MULTIMODAL DETECTION SCHEMAS
# =====================================================================

class TextAnalysisRequest(BaseModel):
    text: str = Field(..., min_length=10, description="Full text news content or article snippet to analyze")
    title: Optional[str] = Field(None, max_length=500, description="Optional article headline")


class GoogleCrossCheckItem(BaseModel):
    title: str
    source: str
    url: Optional[str] = None
    snippet: Optional[str] = None
    similarity_or_verdict: Optional[str] = None


class GoogleCrossCheckData(BaseModel):
    status: str = "completed"
    search_query: str
    total_sources_found: int = 0
    corroborating_evidence: List[Dict[str, Any]] = Field(default_factory=list)
    fact_check_consensus: Optional[str] = None
    summary_verdict: str


class DetectionResultResponse(BaseModel):
    id: Optional[int] = None
    modality: Literal["TEXT", "IMAGE", "VIDEO", "AUDIO"]
    title: Optional[str] = None
    content_preview: Optional[str] = None
    file_path: Optional[str] = None
    verdict: Literal["REAL", "FAKE", "UNCERTAIN"]
    confidence_score: float = Field(..., ge=0.0, le=100.0, description="Percentage confidence 0-100%")
    reasoning: str = Field(..., description="Structured explanation: why and what was detected")
    detailed_analysis: Optional[Dict[str, Any]] = Field(default_factory=dict)
    google_crosscheck: Optional[Dict[str, Any]] = Field(default_factory=dict)
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AnalysisListResponse(BaseModel):
    total: int
    items: List[DetectionResultResponse]


# =====================================================================
# FEEDBACK SCHEMAS
# =====================================================================

class FeedbackCreateRequest(BaseModel):
    record_id: int
    rating: Optional[int] = Field(None, ge=1, le=5)
    feedback_text: Optional[str] = Field(None, max_length=1000)
    suggested_verdict: Optional[Literal["REAL", "FAKE"]] = None


class FeedbackResponse(BaseModel):
    id: int
    record_id: int
    user_id: int
    rating: Optional[int] = None
    feedback_text: Optional[str] = None
    suggested_verdict: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
