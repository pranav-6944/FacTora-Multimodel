import os
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, delete
from pathlib import Path

from app.db.session import get_db
from app.models.db_models import User, AnalysisRecord, UserFeedback
from app.api.v1.endpoints.auth import get_current_user
from app.core.model_manager import model_manager
from app.core.config import settings

router = APIRouter(prefix="/admin", tags=["Admin Operations"])


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Ensures current authenticated user holds the admin role."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required to access this resource"
        )
    return current_user


@router.get("/overview")
async def get_admin_overview(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Returns system-wide operational metrics, user counts, and database status."""
    # 1. Total counts
    user_count_query = select(func.count(User.id))
    user_count = (await db.execute(user_count_query)).scalar() or 0

    record_count_query = select(func.count(AnalysisRecord.id))
    total_audits = (await db.execute(record_count_query)).scalar() or 0

    feedback_count_query = select(func.count(UserFeedback.id))
    total_feedback = (await db.execute(feedback_count_query)).scalar() or 0

    # 2. Modality counts
    mod_query = select(AnalysisRecord.modality, func.count(AnalysisRecord.id)).group_by(AnalysisRecord.modality)
    mod_res = (await db.execute(mod_query)).all()
    modality_breakdown = {m: c for m, c in mod_res}

    # 3. Veracity counts
    ver_query = select(AnalysisRecord.verdict, func.count(AnalysisRecord.id)).group_by(AnalysisRecord.verdict)
    ver_res = (await db.execute(ver_query)).all()
    veracity_breakdown = {v: c for v, c in ver_res}

    # 4. DB File size
    db_file = Path(settings.BASE_DIR) / "data" / "factora_multimodal.db"
    db_size_bytes = db_file.stat().st_size if db_file.exists() else 0

    return {
        "status": "healthy",
        "total_users": user_count,
        "total_audits": total_audits,
        "total_feedback": total_feedback,
        "modality_breakdown": modality_breakdown,
        "veracity_breakdown": veracity_breakdown,
        "database_size_bytes": db_size_bytes,
        "database_size_kb": round(db_size_bytes / 1024, 2),
        "model_telemetry": model_manager.get_current_telemetry()
    }


@router.get("/users")
async def get_all_users(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Lists all user accounts with their activity metrics."""
    query = select(User).order_by(User.id.asc())
    result = await db.execute(query)
    users = result.scalars().all()

    user_list = []
    for u in users:
        # Count audits for user
        cnt_query = select(func.count(AnalysisRecord.id)).where(AnalysisRecord.user_id == u.id)
        cnt = (await db.execute(cnt_query)).scalar() or 0
        user_list.append({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "audit_count": cnt
        })

    return {"users": user_list, "total": len(user_list)}


@router.post("/users/{user_id}/toggle-role")
async def toggle_user_role(
    user_id: int,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Toggles role between 'admin' and 'user'."""
    if user_id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot toggle your own administrative role"
        )
    query = select(User).where(User.id == user_id)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.role = "user" if user.role == "admin" else "admin"
    await db.commit()
    return {"status": "success", "user_id": user.id, "new_role": user.role}


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Deletes a user account and cascades their audit history."""
    if user_id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own administrative account"
        )
    query = select(User).where(User.id == user_id)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    await db.delete(user)
    await db.commit()
    return {"status": "deleted", "user_id": user_id}


@router.get("/records")
async def get_all_records(
    admin: User = Depends(require_admin),
    modality: Optional[str] = None,
    verdict: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """Lists verification records across all users with optional filtering."""
    query = select(AnalysisRecord, User.username).join(User, AnalysisRecord.user_id == User.id)

    if modality:
        query = query.where(AnalysisRecord.modality == modality.upper())
    if verdict:
        query = query.where(AnalysisRecord.verdict == verdict.upper())

    query = query.order_by(desc(AnalysisRecord.created_at)).offset(offset).limit(limit)
    result = await db.execute(query)
    rows = result.all()

    records = []
    for rec, uname in rows:
        records.append({
            "id": rec.id,
            "user_id": rec.user_id,
            "username": uname,
            "modality": rec.modality,
            "title": rec.title,
            "content_preview": rec.content_preview,
            "verdict": rec.verdict,
            "confidence_score": rec.confidence_score,
            "reasoning": rec.reasoning,
            "detailed_analysis": rec.detailed_analysis,
            "google_crosscheck": rec.google_crosscheck,
            "created_at": rec.created_at.isoformat() if rec.created_at else None
        })

    return {"records": records, "count": len(records)}


@router.delete("/records/{record_id}")
async def delete_record(
    record_id: int,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Deletes an audit verification record."""
    query = select(AnalysisRecord).where(AnalysisRecord.id == record_id)
    result = await db.execute(query)
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")

    await db.delete(record)
    await db.commit()
    return {"status": "deleted", "record_id": record_id}


@router.delete("/records/purge-all")
async def purge_all_records(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Purges all analysis records across the platform."""
    await db.execute(delete(AnalysisRecord))
    await db.commit()
    return {"status": "all_records_purged"}


@router.get("/feedback")
async def get_all_feedback(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Lists all user feedback submissions."""
    query = select(UserFeedback, User.username).join(User, UserFeedback.user_id == User.id).order_by(desc(UserFeedback.created_at))
    result = await db.execute(query)
    rows = result.all()

    feedback_list = []
    for fb, uname in rows:
        feedback_list.append({
            "id": fb.id,
            "record_id": fb.record_id,
            "username": uname,
            "rating": fb.rating,
            "feedback_text": fb.feedback_text,
            "suggested_verdict": fb.suggested_verdict,
            "created_at": fb.created_at.isoformat() if fb.created_at else None
        })

    return {"feedback": feedback_list, "total": len(feedback_list)}


@router.delete("/feedback/{feedback_id}")
async def delete_feedback(
    feedback_id: int,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Deletes a feedback submission."""
    query = select(UserFeedback).where(UserFeedback.id == feedback_id)
    result = await db.execute(query)
    fb = result.scalar_one_or_none()
    if not fb:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feedback not found")

    await db.delete(fb)
    await db.commit()
    return {"status": "deleted", "feedback_id": feedback_id}


@router.get("/model-lifecycle")
async def get_model_lifecycle(admin: User = Depends(require_admin)):
    """Returns genuine real-time model memory and ejection telemetry."""
    return {
        "telemetry": model_manager.get_current_telemetry(),
        "recent_events": model_manager.get_telemetry_history(limit=25)
    }
