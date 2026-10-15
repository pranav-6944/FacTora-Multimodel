import io
import zipfile
from pathlib import Path
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional

from app.core.config import settings
from app.services.text_detector import TextDetectorService
from app.services.source_verifier import verify_source

router = APIRouter(prefix="/extension", tags=["Browser Extension"])


class ExtensionScoreRequest(BaseModel):
    headline: Optional[str] = None
    text: Optional[str] = None
    source_url: Optional[str] = None
    url: Optional[str] = None


@router.get("/ping")
async def extension_ping():
    """
    Ping endpoint used by the Chrome/Edge extension to check if backend is online.
    """
    return {
        "status": "online",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "extension_compatible": True,
        "supported_modalities": ["TEXT", "IMAGE", "VIDEO", "AUDIO"]
    }


@router.get("/download")
async def download_extension_zip():
    """
    Package the browser extension into a zip archive and stream to the user for instant 1-click install.
    """
    # Locate browser_extension folder in FacTora
    ext_dir = settings.BASE_DIR.parent / "browser_extension"
    if not ext_dir.exists():
        # Fallback check in current dir
        ext_dir = settings.BASE_DIR / "browser_extension"

    if not ext_dir.exists():
        raise HTTPException(status_code=404, detail="Extension directory not found on host.")

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        for file_path in ext_dir.rglob("*"):
            if file_path.is_file():
                rel_path = file_path.relative_to(ext_dir)
                zf.write(file_path, arcname=str(rel_path))

    zip_buffer.seek(0)
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=factora-multimodal-extension.zip"}
    )


@router.post("/score")
async def extension_credibility_score(payload: ExtensionScoreRequest):
    """
    Extension compatibility endpoint. Analyzes headline and optional source URL.
    """
    claim_text = (payload.headline or payload.text or "").strip()
    if not claim_text:
        raise HTTPException(status_code=400, detail="Headline or text is required")

    result = await TextDetectorService.analyze_text(text=claim_text, title=claim_text[:100])
    
    # Check source URL if provided
    source_url_val = (payload.source_url or payload.url or "").strip() or None
    source_info = None
    if source_url_val:
        source_info = await verify_source(source_url_val)

    verdict = result["verdict"]
    conf = result["confidence_score"]

    grade = "A" if (verdict == "REAL" and conf > 80) else ("B" if verdict == "REAL" else ("D" if conf < 70 else "F"))
    cred_score = conf if verdict == "REAL" else round(100.0 - conf, 1)

    return {
        "headline": claim_text,
        "verdict": verdict,
        "credibility_score": cred_score,
        "grade": grade,
        "reasoning": result["reasoning"],
        "factors": {
            "source_reliability": source_info.get("trust_score", 70) if source_info else 75,
            "model_confidence": round(conf, 1),
            "corroboration": 85 if result.get("google_crosscheck", {}).get("found") else 50
        },
        "source_check": source_info,
        "google_crosscheck": result.get("google_crosscheck")
    }
