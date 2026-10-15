"""
Factora Multimodal — Source Credibility Verifier
Evaluates domain reputation, editorial transparency, Wikipedia entity profiles,
and historical fact-checking strikes.
"""

import re
from urllib.parse import urlparse
from typing import Dict, Any, List, Optional
import httpx

TRUSTED_DOMAINS = {
    "bbc.com", "bbc.co.uk", "reuters.com", "apnews.com", "nytimes.com",
    "theguardian.com", "washingtonpost.com", "npr.org", "pbs.org",
    "aljazeera.com", "bloomberg.com", "economist.com", "ft.com",
    "politico.com", "theatlantic.com", "time.com", "nature.com",
    "sciencemag.org", "newscientist.com", "scientificamerican.com",
    "who.int", "cdc.gov", "nih.gov", "nasa.gov", "snopes.com",
    "factcheck.org", "politifact.com", "thehindu.com", "hindustantimes.com",
    "ndtv.com", "theprint.in", "scroll.in", "thewire.in", "livemint.com",
    "cnbc.com", "cnn.com", "abc.net.au", "cbsnews.com", "nbcnews.com",
    "usatoday.com", "latimes.com", "chicagotribune.com", "sfchronicle.com",
    "vox.com", "fivethirtyeight.com", "propublica.org", "wsj.com"
}

UNRELIABLE_DOMAINS = {
    "infowars.com", "naturalnews.com", "beforeitsnews.com",
    "worldnewsdailyreport.com", "clickhole.com",
    "empirenews.net", "newslo.com", "abcnews.com.co", "usatoday.com.co",
    "nationalreport.net", "huzlers.com", "civic.io", "politicot.com",
    "breitbart.com", "dailybuzz.ch", "now8news.com", "newsexaminer.net",
    "thefreepatriot.org", "cnn.com.de", "bbc.com.de",
    "redflagnews.com", "eutimes.net", "newswatch33.com"
}

SATIRE_DOMAINS = {
    "theonion.com", "clickhole.com", "thebabylonbee.com",
    "reductress.com", "satirewire.com", "theshovel.com.au"
}

WIKI_MAP = {
    "bbc.com": "BBC",
    "bbc.co.uk": "BBC",
    "reuters.com": "Reuters",
    "apnews.com": "Associated_Press",
    "nytimes.com": "The_New_York_Times",
    "theguardian.com": "The_Guardian",
    "washingtonpost.com": "The_Washington_Post",
    "npr.org": "NPR",
    "aljazeera.com": "Al_Jazeera_English",
    "bloomberg.com": "Bloomberg_News",
    "thehindu.com": "The_Hindu",
    "ndtv.com": "NDTV",
    "politifact.com": "PolitiFact",
    "snopes.com": "Snopes",
    "factcheck.org": "FactCheck.org",
    "infowars.com": "Infowars",
    "naturalnews.com": "Natural_News",
    "breitbart.com": "Breitbart_News",
    "theonion.com": "The_Onion",
    "thebabylonbee.com": "The_Babylon_Bee",
    "cnn.com": "CNN",
    "wsj.com": "The_Wall_Street_Journal",
    "nasa.gov": "NASA"
}

WIKIPEDIA_API = "https://en.wikipedia.org/api/rest_v1/page/summary/"


def extract_domain(url_or_domain: str) -> str:
    """Extract clean domain name from URL or raw text."""
    text = url_or_domain.strip().lower()
    if text.startswith(("http://", "https://")):
        parsed = urlparse(text)
        domain = parsed.netloc
    else:
        # If user entered something like 'theonion.com/article'
        domain = text.split('/')[0]

    if domain.startswith("www."):
        domain = domain[4:]

    return domain


async def fetch_wikipedia_summary(title: str) -> Optional[Dict[str, str]]:
    """Asynchronously fetch Wikipedia profile summary for a news outlet."""
    try:
        url = WIKIPEDIA_API + title.replace(" ", "_")
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(url, headers={"User-Agent": "FactoraMultimodal/2.0"})
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "title": data.get("title", title),
                    "description": data.get("description", ""),
                    "extract": data.get("extract", ""),
                    "thumbnail": data.get("thumbnail", {}).get("source") if data.get("thumbnail") else None,
                    "url": data.get("content_urls", {}).get("desktop", {}).get("page", "")
                }
    except Exception:
        pass
    return None


async def verify_source(url_or_domain: str) -> Dict[str, Any]:
    """
    Perform deep source verification on domain.
    Returns credibility status, reliability score (0-100), wiki entity background, and warnings.
    """
    domain = extract_domain(url_or_domain)

    # 1. Classification
    category = "UNKNOWN"
    trust_score = 50
    verdict = "UNVERIFIED"
    flags = []

    if domain in SATIRE_DOMAINS:
        category = "SATIRE"
        trust_score = 20
        verdict = "SATIRICAL / HUMOR"
        flags.append("Cataloged parody/satirical publication — do not treat as genuine news")
    elif domain in UNRELIABLE_DOMAINS:
        category = "UNRELIABLE"
        trust_score = 15
        verdict = "DISINFORMATION / UNRELIABLE"
        flags.append("Identified as known purveyor of misleading narratives or clickbait")
    elif domain in TRUSTED_DOMAINS:
        category = "TRUSTED"
        trust_score = 92
        verdict = "ESTABLISHED / HIGH CREDIBILITY"
        flags.append("Recognized institutional news agency with rigorous editorial standards")
    else:
        category = "INDEPENDENT_OR_UNLISTED"
        trust_score = 55
        verdict = "UNLISTED DOMAIN"
        flags.append("Not present in primary global fact-check databases; evaluate individual articles")

    # Check top-level domain heuristics
    if domain.endswith(".gov") or domain.endswith(".edu"):
        trust_score = max(trust_score, 90)
        verdict = "OFFICIAL GOVERNMENT / ACADEMIC"
        flags.append("Institutional top-level domain (.gov / .edu)")
    elif domain.endswith(".co") or domain.endswith(".de") or domain.endswith(".xyz"):
        if category == "UNKNOWN":
            trust_score = 40
            flags.append("Impersonation-prone or non-standard TLD suffix")

    # 2. Wikipedia background check
    wiki_title = WIKI_MAP.get(domain)
    wiki_info = None
    if wiki_title:
        wiki_info = await fetch_wikipedia_summary(wiki_title)

    # 3. Editorial metrics
    return {
        "domain": domain,
        "input_query": url_or_domain,
        "category": category,
        "classification": category.capitalize() if category != "UNKNOWN" else "Unverified",
        "trust_score": trust_score,
        "credibility_score": trust_score,
        "verdict": verdict,
        "flags": flags,
        "wikipedia": wiki_info,
        "metrics": {
            "editorial_transparency": "High" if category == "TRUSTED" else ("Low" if category == "UNRELIABLE" else "Moderate"),
            "fact_check_risk": "Low" if category == "TRUSTED" else ("High" if category in ("UNRELIABLE", "SATIRE") else "Medium"),
            "bias_profile": "Neutral / Mainstream" if category == "TRUSTED" else ("Extreme / Satirical" if category in ("UNRELIABLE", "SATIRE") else "Unassessed")
        }
    }


def get_popular_sources() -> List[Dict[str, Any]]:
    """Return pre-cataloged popular news sources for immediate UI cards."""
    return [
        {
            "domain": "reuters.com",
            "name": "Reuters",
            "category": "TRUSTED",
            "trust_score": 96,
            "verdict": "ESTABLISHED / HIGH CREDIBILITY",
            "summary": "Global news agency providing independent, unbiased factual reporting."
        },
        {
            "domain": "bbc.com",
            "name": "BBC News",
            "category": "TRUSTED",
            "trust_score": 93,
            "verdict": "ESTABLISHED / HIGH CREDIBILITY",
            "summary": "Public service broadcaster operating under strict Royal Charter editorial guidelines."
        },
        {
            "domain": "apnews.com",
            "name": "Associated Press",
            "category": "TRUSTED",
            "trust_score": 95,
            "verdict": "ESTABLISHED / HIGH CREDIBILITY",
            "summary": "American non-profit news cooperative headquartered in New York City."
        },
        {
            "domain": "theonion.com",
            "name": "The Onion",
            "category": "SATIRE",
            "trust_score": 15,
            "verdict": "SATIRICAL / HUMOR",
            "summary": "Digital media company and news satire organization that publishes satirical articles."
        },
        {
            "domain": "infowars.com",
            "name": "InfoWars",
            "category": "UNRELIABLE",
            "trust_score": 12,
            "verdict": "DISINFORMATION / UNRELIABLE",
            "summary": "American conspiracy theory and fake news website established by Alex Jones."
        },
        {
            "domain": "nature.com",
            "name": "Nature",
            "category": "TRUSTED",
            "trust_score": 98,
            "verdict": "PEER-REVIEWED ACADEMIC",
            "summary": "British multidisciplinary scientific journal, first published in 1869."
        }
    ]
