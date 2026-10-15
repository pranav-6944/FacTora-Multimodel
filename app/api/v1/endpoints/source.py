from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from app.services.source_verifier import verify_source, get_popular_sources

router = APIRouter(prefix="/source", tags=["Source Verification"])


@router.get("/verify")
async def verify_domain_or_url(
    query: Optional[str] = Query(None, description="Domain or URL to check"),
    domain: Optional[str] = Query(None, description="Alternative domain parameter")
):
    """
    Verify credibility, editorial transparency, and reputation of a news domain or publication.
    """
    search_term = (query or domain or "").strip()
    if not search_term:
        raise HTTPException(status_code=400, detail="Query or domain parameter cannot be empty")
    return await verify_source(search_term)


@router.get("/popular")
async def list_popular_sources():
    """
    List pre-cataloged reference sources (Reuters, BBC, The Onion, InfoWars, etc.)
    """
    return get_popular_sources()
