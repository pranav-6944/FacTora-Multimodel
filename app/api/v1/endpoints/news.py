from fastapi import APIRouter, Query
from typing import Optional
from app.services.news_service import fetch_live_news, fetch_full_article_content

router = APIRouter(prefix="/news", tags=["Live News Radar"])


@router.get("/live")
async def get_live_news_stream(
    category: str = Query("general", description="News category: general, technology, science, business, health"),
    q: Optional[str] = Query(None, description="Optional search keywords")
):
    """
    Fetch real-time breaking news stream from NewsAPI or curated radar.
    """
    articles = await fetch_live_news(category=category, query=q)
    return {
        "category": category,
        "total": len(articles),
        "articles": articles
    }


@router.get("/extract-full-text")
async def extract_article_full_text(
    url: str = Query(..., description="Original news wire article URL"),
    fallback: Optional[str] = Query("", description="Fallback preview text")
):
    """
    Extracts the full multi-paragraph article body from the external news wire URL,
    avoiding truncated NewsAPI snippets like '[+2479 chars]'.
    """
    full_text = await fetch_full_article_content(url, fallback or "")
    return {
        "url": url,
        "content": full_text
    }
