import os
import shutil
from pathlib import Path
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.config import settings
from app.db.session import get_db
from app.models.db_models import User, AnalysisRecord, UserFeedback
from app.models.schemas import (
    TextAnalysisRequest, DetectionResultResponse, AnalysisListResponse,
    FeedbackCreateRequest, FeedbackResponse
)
from app.api.v1.endpoints.auth import get_current_user
from app.services.text_detector import TextDetectorService
from app.services.image_detector import ImageDetectorService
from app.services.video_detector import VideoDetectorService
from app.services.audio_detector import AudioDetectorService

router = APIRouter(prefix="/detect", tags=["Multimodal Detection"])


# Allowed file extensions per modality
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff"}
VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".webm", ".mkv", ".m4v"}
AUDIO_EXTENSIONS = {".mp3", ".wav", ".m4a", ".ogg", ".flac", ".aac"}


def _save_upload_file(file: UploadFile, user_id: int, prefix: str) -> tuple[Path, str]:
    """Helper to save uploaded file safely in data/uploads/."""
    ext = Path(file.filename or "upload.bin").suffix.lower()
    safe_name = f"{prefix}_u{user_id}_{os.urandom(8).hex()}{ext}"
    dest_path = settings.UPLOAD_DIR / safe_name
    return dest_path, safe_name


# =====================================================================
# 1. TEXT NEWS DETECTION ENDPOINT
# =====================================================================
@router.post("/text", response_model=DetectionResultResponse, status_code=status.HTTP_201_CREATED)
async def detect_text(
    payload: TextAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Analyzes news claim text using Kaggle fine-tuned RoBERTa model
    and cross-checks live facts using Google API with structured reasoning.
    Stores analysis record securely tied to the authenticated user.
    """
    analysis = await TextDetectorService.analyze_text(
        text=payload.text,
        title=payload.title
    )

    # Save to user's isolated record database
    record = AnalysisRecord(
        user_id=current_user.id,
        modality="TEXT",
        title=payload.title or payload.text[:80],
        content_preview=payload.text[:300],
        file_path=None,
        file_hash=None,
        verdict=analysis["verdict"],
        confidence_score=analysis["confidence_score"],
        reasoning=analysis["reasoning"],
        detailed_analysis=analysis["detailed_analysis"],
        google_crosscheck=analysis["google_crosscheck"]
    )
    db.add(record)
    await db.flush()
    await db.refresh(record)

    return DetectionResultResponse.model_validate(record)


# =====================================================================
# 2. IMAGE FORENSIC DETECTION ENDPOINT
# =====================================================================
@router.post("/image", response_model=DetectionResultResponse, status_code=status.HTTP_201_CREATED)
async def detect_image(
    file: UploadFile = File(..., description="Image file to analyze (.png, .jpg, .jpeg, .webp)"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Detects AI-generated, synthetic, and manipulated images using
    Error Level Analysis (ELA) and EXIF software tampering tags.
    """
    filename = file.filename or "uploaded_image.jpg"
    ext = Path(filename).suffix.lower()
    if ext not in IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported image file format '{ext}'. Allowed: {', '.join(IMAGE_EXTENSIONS)}"
        )

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded image is empty")

    # Save to local storage
    safe_name = f"img_u{current_user.id}_{os.urandom(8).hex()}{ext}"
    dest_path = settings.UPLOAD_DIR / safe_name
    dest_path.write_bytes(file_bytes)

    # Analyze
    analysis = await ImageDetectorService.analyze_image(file_bytes, filename)

    record = AnalysisRecord(
        user_id=current_user.id,
        modality="IMAGE",
        title=filename,
        content_preview=f"Image upload: {filename} ({len(file_bytes)} bytes)",
        file_path=str(dest_path),
        file_hash=analysis["detailed_analysis"]["file_info"]["file_hash_sha256"],
        verdict=analysis["verdict"],
        confidence_score=analysis["confidence_score"],
        reasoning=analysis["reasoning"],
        detailed_analysis=analysis["detailed_analysis"],
        google_crosscheck={}
    )
    db.add(record)
    await db.flush()
    await db.refresh(record)

    return DetectionResultResponse.model_validate(record)


# =====================================================================
# 3. VIDEO DEEPFAKE DETECTION ENDPOINT
# =====================================================================
@router.post("/video", response_model=DetectionResultResponse, status_code=status.HTTP_201_CREATED)
async def detect_video(
    file: UploadFile = File(..., description="Video file to analyze (.mp4, .mov, .avi, .webm)"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Detects deepfake, face-swap, and synthetic AI video generation using
    container forensics and temporal frame compression heuristics.
    """
    filename = file.filename or "uploaded_video.mp4"
    ext = Path(filename).suffix.lower()
    if ext not in VIDEO_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported video file format '{ext}'. Allowed: {', '.join(VIDEO_EXTENSIONS)}"
        )

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded video is empty")

    safe_name = f"vid_u{current_user.id}_{os.urandom(8).hex()}{ext}"
    dest_path = settings.UPLOAD_DIR / safe_name
    dest_path.write_bytes(file_bytes)

    analysis = await VideoDetectorService.analyze_video(file_bytes, filename)

    record = AnalysisRecord(
        user_id=current_user.id,
        modality="VIDEO",
        title=filename,
        content_preview=f"Video upload: {filename} ({len(file_bytes)} bytes)",
        file_path=str(dest_path),
        file_hash=analysis["detailed_analysis"]["file_info"]["sha256_hash"],
        verdict=analysis["verdict"],
        confidence_score=analysis["confidence_score"],
        reasoning=analysis["reasoning"],
        detailed_analysis=analysis["detailed_analysis"],
        google_crosscheck={}
    )
    db.add(record)
    await db.flush()
    await db.refresh(record)

    return DetectionResultResponse.model_validate(record)


# =====================================================================
# 4. AUDIO SYNTHETIC VOICE DETECTION ENDPOINT
# =====================================================================
@router.post("/audio", response_model=DetectionResultResponse, status_code=status.HTTP_201_CREATED)
async def detect_audio(
    file: UploadFile = File(..., description="Audio file to analyze (.mp3, .wav, .m4a, .ogg)"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Detects synthetic voice clones, AI TTS, and acoustic tampering using
    spectral noise floor analysis and neural voice cloning signatures.
    """
    filename = file.filename or "uploaded_audio.mp3"
    ext = Path(filename).suffix.lower()
    if ext not in AUDIO_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported audio file format '{ext}'. Allowed: {', '.join(AUDIO_EXTENSIONS)}"
        )

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded audio is empty")

    safe_name = f"aud_u{current_user.id}_{os.urandom(8).hex()}{ext}"
    dest_path = settings.UPLOAD_DIR / safe_name
    dest_path.write_bytes(file_bytes)

    analysis = await AudioDetectorService.analyze_audio(file_bytes, filename)

    record = AnalysisRecord(
        user_id=current_user.id,
        modality="AUDIO",
        title=filename,
        content_preview=f"Audio upload: {filename} ({len(file_bytes)} bytes)",
        file_path=str(dest_path),
        file_hash=analysis["detailed_analysis"]["file_info"]["sha256_hash"],
        verdict=analysis["verdict"],
        confidence_score=analysis["confidence_score"],
        reasoning=analysis["reasoning"],
        detailed_analysis=analysis["detailed_analysis"],
        google_crosscheck={}
    )
    db.add(record)
    await db.flush()
    await db.refresh(record)

    return DetectionResultResponse.model_validate(record)


# =====================================================================
# 5. USER HISTORY & DETAIL ENDPOINTS (STRICT DATA PRIVACY ISOLATION)
# =====================================================================
@router.get("/history", response_model=AnalysisListResponse)
async def get_user_history(
    modality: Optional[str] = Query(None, description="Optional filter by modality: TEXT, IMAGE, VIDEO, AUDIO"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves verification history strictly scoped to the authenticated user.
    Users CANNOT view any other user's verification records.
    """
    query = select(AnalysisRecord).where(AnalysisRecord.user_id == current_user.id)
    if modality:
        query = query.where(AnalysisRecord.modality == modality.upper().strip())

    query = query.order_by(desc(AnalysisRecord.created_at)).offset(offset).limit(limit)
    result = await db.execute(query)
    records = result.scalars().all()

    return AnalysisListResponse(
        total=len(records),
        items=[DetectionResultResponse.model_validate(r) for r in records]
    )


@router.get("/record/{record_id}", response_model=DetectionResultResponse)
async def get_record_detail(
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves a single analysis record with full detailed forensics.
    Strictly verifies ownership: Returns 404 if record belongs to someone else.
    """
    query = select(AnalysisRecord).where(
        AnalysisRecord.id == record_id,
        AnalysisRecord.user_id == current_user.id
    )
    result = await db.execute(query)
    record = result.scalar_one_or_none()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis record not found in your account"
        )

    return DetectionResultResponse.model_validate(record)


# =====================================================================
# 6. USER FEEDBACK / CORRECTION ENDPOINT
# =====================================================================
@router.post("/feedback", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
async def submit_feedback(
    payload: FeedbackCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Allows user to rate or suggest a verdict correction on their analysis."""
    # Verify ownership of the record
    q = select(AnalysisRecord).where(
        AnalysisRecord.id == payload.record_id,
        AnalysisRecord.user_id == current_user.id
    )
    res = await db.execute(q)
    record = res.scalar_one_or_none()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cannot attach feedback: Record not found in your account"
        )

    feedback = UserFeedback(
        record_id=payload.record_id,
        user_id=current_user.id,
        rating=payload.rating,
        feedback_text=payload.feedback_text,
        suggested_verdict=payload.suggested_verdict
    )
    db.add(feedback)
    await db.flush()
    await db.refresh(feedback)

    return FeedbackResponse.model_validate(feedback)


# =====================================================================
# 7. USER ANALYTICS & CSV AUDIT EXPORT
# =====================================================================
@router.get("/analytics")
async def get_user_analytics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Computes overall analytics metrics strictly for the authenticated user.
    """
    q = select(AnalysisRecord).where(AnalysisRecord.user_id == current_user.id)
    res = await db.execute(q)
    records = res.scalars().all()

    total = len(records)
    real_count = sum(1 for r in records if r.verdict == "REAL")
    fake_count = sum(1 for r in records if r.verdict == "FAKE")
    modalities = {"TEXT": 0, "IMAGE": 0, "VIDEO": 0, "AUDIO": 0}

    for r in records:
        if r.modality in modalities:
            modalities[r.modality] += 1

    avg_conf = round(sum(r.confidence_score for r in records) / total, 1) if total > 0 else 0.0

    return {
        "total_verifications": total,
        "total_audits": total,
        "real_count": real_count,
        "fake_count": fake_count,
        "real_percentage": round((real_count / total * 100), 1) if total > 0 else 0.0,
        "fake_percentage": round((fake_count / total * 100), 1) if total > 0 else 0.0,
        "average_confidence": avg_conf,
        "modalities": modalities,
        "modality_breakdown": modalities
    }


@router.get("/export-csv")
async def export_user_history_csv(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Streams CSV export of current user's private audit records.
    """
    import csv
    import io
    from fastapi.responses import StreamingResponse

    q = select(AnalysisRecord).where(AnalysisRecord.user_id == current_user.id).order_by(AnalysisRecord.created_at.desc())
    res = await db.execute(q)
    records = res.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Audit_ID", "Modality", "Title", "Verdict", "Confidence Score (%)", "Timestamp", "Reasoning Summary"])

    for r in records:
        writer.writerow([
            r.id,
            r.modality,
            r.title or "Untitled",
            r.verdict,
            r.confidence_score,
            r.created_at.strftime("%Y-%m-%d %H:%M:%S") if r.created_at else "",
            (r.reasoning or "")[:200].replace("\n", " ")
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=factora-audit-history-{current_user.username}.csv"}
    )

