import re
from typing import List, Dict, Any, Optional
import httpx
from bs4 import BeautifulSoup
from app.core.config import settings


def clean_truncated_content(text: str) -> str:
    """
    Strips NewsAPI truncation artifacts such as '... [+2479 chars]' or '[+150 chars]'
    so the user never sees raw snippet artifacts.
    """
    if not text:
        return ""
    # Remove patterns like '... [+2479 chars]', '… [+123 chars]', '[+456 chars]'
    cleaned = re.sub(r"\s*(?:\.{3}|…)?\s*\[\+\d+\s*chars\]\s*$", "", text).strip()
    return cleaned


async def fetch_full_article_content(url: str, fallback_text: str = "") -> str:
    """
    Extracts the complete article body from the original news wire URL.
    Removes ads, scripts, and navigation clutter, joining multi-paragraph narrative text.
    Falls back gracefully if the URL is unreachable or paywalled.
    """
    cleaned_fallback = clean_truncated_content(fallback_text)
    if not url or not url.startswith("http"):
        return cleaned_fallback

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9"
    }

    try:
        async with httpx.AsyncClient(timeout=4.0, follow_redirects=True) as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "html.parser")

                # Remove non-content elements
                for element in soup(["script", "style", "nav", "footer", "header", "aside", "noscript", "form", "svg"]):
                    element.decompose()

                # Find dominant article container if available
                article_box = (
                    soup.find("article") or
                    soup.find("main") or
                    soup.find("div", class_=re.compile(r"article[-_]body|story[-_]body|post[-_]content|entry[-_]content|article__body", re.I))
                )
                target = article_box if article_box else soup

                paragraphs = []
                for p in target.find_all("p"):
                    p_text = p.get_text(separator=" ", strip=True)
                    # Filter out tiny notices, cookies, social sharing prompts
                    if len(p_text) > 40 and not re.search(r"cookie|subscribe|newsletter|all rights reserved|sign up|follow us", p_text, re.I):
                        paragraphs.append(p_text)

                if paragraphs and len(paragraphs) >= 2:
                    joined = "\n\n".join(paragraphs)
                    # Cap at generous 4500 characters
                    return joined[:4500].strip()
    except Exception as e:
        print(f"[NEWS EXTRACTOR] Could not scrape wire content from {url}: {e}")

    return cleaned_fallback

# Curated breaking topics fallback if external API is unreachable
FALLBACK_HEADLINES = [
    {
        "title": "NASA's James Webb Space Telescope Detects Carbon Dioxide on Habitable-Zone Exoplanet",
        "description": "Astronomers using spectroscopic data confirm atmospheric components on exoplanet K2-18b, marking a significant milestone in astrobiology.",
        "source": "NASA News",
        "category": "science",
        "url": "https://www.nasa.gov",
        "image_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
        "published_at": "2026-10-12T14:30:00Z",
        "is_trending": True,
        "sample_body": "Astronomers analyzing transmission spectra from NASA's James Webb Space Telescope have identified definitive absorption signatures corresponding to carbon-bearing molecules including methane and carbon dioxide in the atmosphere of sub-Neptune exoplanet K2-18 b."
    },
    {
        "title": "Global Tech Summit Announces New Open Standards for Deepfake Watermarking",
        "description": "Leading artificial intelligence companies agree on cryptographically signed C2PA provenance metadata to protect online journalism.",
        "source": "Reuters Tech",
        "category": "technology",
        "url": "https://www.reuters.com",
        "image_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
        "published_at": "2026-10-12T12:15:00Z",
        "is_trending": True,
        "sample_body": "A coalition of premier artificial intelligence laboratories and digital publishing networks announced universal adoption of Coalition for Content Provenance and Authenticity (C2PA) cryptographic watermarking protocols across all consumer image and video generation tools."
    },
    {
        "title": "Viral Video Claims Ancient Pyramid Discovered Under Antarctic Ice Shelf",
        "description": "Geologists debunk popular social media claims pointing to wind-carved nunatak formations as artificial human structures.",
        "source": "Factora Radar",
        "category": "general",
        "url": "https://factcheck.org",
        "image_url": "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?w=800&auto=format&fit=crop&q=80",
        "published_at": "2026-10-12T09:45:00Z",
        "is_trending": True,
        "sample_body": "SHOCKING DISCOVERY: Satellite radar reveals a massive symmetrical 4-sided pyramid hidden beneath deep Antarctic glaciers! The mainstream establishment refuses to explain what ancient civilization constructed it!"
    },
    {
        "title": "World Health Organization Issues Guidance on Emerging Respiratory Seasonal Strain",
        "description": "Public health agencies note standard immunization remains effective against current circulating variants with low hospitalization rates.",
        "source": "WHO Health News",
        "category": "health",
        "url": "https://www.who.int",
        "image_url": "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80",
        "published_at": "2026-10-12T08:00:00Z",
        "is_trending": False,
        "sample_body": "The World Health Organization published updated epidemiological surveillance data confirming seasonal influenza and respiratory syncytial virus activity aligns with multi-year baseline averages across the northern hemisphere."
    },
    {
        "title": "Renewable Energy Capacity Surpasses Forecasts with 35% Year-Over-Year Surge",
        "description": "International Energy Agency report highlights accelerated solar and wind deployments across global manufacturing hubs.",
        "source": "Financial Times",
        "category": "business",
        "url": "https://www.ft.com",
        "image_url": "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&auto=format&fit=crop&q=80",
        "published_at": "2026-10-12T06:30:00Z",
        "is_trending": False,
        "sample_body": "Global additions of renewable energy capacity increased by fifty percent in the past calendar year, driven by expanding utility-scale solar photovoltaic arrays and lowering module production costs."
    }
]


async def fetch_live_news(category: str = "general", query: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Fetch live news headlines from NewsAPI or curated stream.
    Strictly avoids returning dummy data if a search query yielded zero results.
    """
    api_key = settings.NEWS_API_KEY
    if api_key and api_key.strip():
        try:
            url = "https://newsapi.org/v2/top-headlines"
            params = {
                "apiKey": api_key,
                "language": "en",
                "pageSize": 20
            }
            if category and category != "all" and category != "general":
                params["category"] = category
            if query and query.strip():
                params["q"] = query.strip()

            async with httpx.AsyncClient(timeout=6.0) as client:
                resp = await client.get(url, params=params)
                if resp.status_code == 200:
                    data = resp.json()
                    articles = data.get("articles", [])
                    # When searching a keyword and no articles are found, return empty list (NO dummy data fallback)
                    if query and query.strip() and not articles:
                        return []

                    if articles:
                        return [
                            {
                                "title": art.get("title", ""),
                                "description": art.get("description", "") or art.get("title", ""),
                                "source": art.get("source", {}).get("name", "Unknown Source"),
                                "category": category,
                                "url": art.get("url", ""),
                                "image_url": art.get("urlToImage"),
                                "published_at": art.get("publishedAt", ""),
                                "is_trending": idx < 2,
                                "sample_body": clean_truncated_content(art.get("content") or art.get("description") or art.get("title", ""))
                            }
                            for idx, art in enumerate(articles) if art.get("title")
                        ]
        except Exception as e:
            print(f"[NEWS SERVICE] NewsAPI error: {e}, falling back to curated feed")

    # If user searched a keyword and NewsAPI failed, check local titles.
    # If no match found, RETURN EMPTY LIST [] (NEVER fallback to unrelated dummy data).
    if query and query.strip():
        q_lower = query.strip().lower()
        matched = [
            h for h in FALLBACK_HEADLINES
            if q_lower in h["title"].lower() or q_lower in h.get("description", "").lower()
        ]
        return matched

    # For default non-search view:
    results = FALLBACK_HEADLINES
    if category and category != "all" and category != "general":
        matched = [h for h in results if h["category"] == category]
        if matched:
            results = matched

    return results
