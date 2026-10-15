import asyncio
import io
import sys
from pathlib import Path

# Fix Windows console encoding
if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db.session import engine, Base


async def run_port_tests():
    print("=" * 70)
    print(" FACTORA MULTIMODAL - OLD WEBSITE FEATURES & EXTENSION PORT VERIFICATION")
    print("=" * 70)

    # Initialize db tables if needed
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # TEST 1: LIVE NEWS SERVICE
        print("\n[TEST 1] Testing Live News Service (/api/v1/news/live)...")
        resp_news = await client.get("/api/v1/news/live?category=general")
        assert resp_news.status_code == 200, f"Live news failed: {resp_news.text}"
        news_data = resp_news.json()
        assert "articles" in news_data
        assert len(news_data["articles"]) > 0
        first_art = news_data["articles"][0]
        print(f"  -> Returned {len(news_data['articles'])} articles. Sample title: '{first_art['title'][:60]}...'")
        print("  -> PASSED: Live News Feed is active and returns structured articles.")

        # TEST 2: SOURCE CREDIBILITY VERIFIER
        print("\n[TEST 2] Testing Source Verifier (/api/v1/source/verify & /popular)...")
        resp_source = await client.get("/api/v1/source/verify?domain=bbc.com")
        assert resp_source.status_code == 200, f"Source verify failed: {resp_source.text}"
        src_data = resp_source.json()
        assert src_data["domain"] == "bbc.com"
        assert src_data["credibility_score"] >= 80
        assert src_data["classification"] == "Trusted"
        wiki_extract = (src_data.get('wikipedia') or {}).get('extract', 'No wikipedia snippet')
        print(f"  -> bbc.com Score: {src_data['credibility_score']}%, Class: {src_data['classification']}, Wiki snippet: {wiki_extract[:70]}...")

        resp_pop = await client.get("/api/v1/source/popular")
        assert resp_pop.status_code == 200
        pop_list = resp_pop.json()
        assert len(pop_list) >= 4
        print(f"  -> Popular outlets loaded: {[p['domain'] for p in pop_list[:4]]}")
        print("  -> PASSED: Source Credibility & Wikipedia dossiers active.")

        # TEST 3: BROWSER EXTENSION INTEGRATIONS
        print("\n[TEST 3] Testing Extension Hub & Compatibility Endpoints...")
        # A. Ping
        resp_ping = await client.get("/api/v1/extension/ping")
        assert resp_ping.status_code == 200
        assert resp_ping.json()["status"] == "online"
        print("  -> Extension Ping: Online and compatible.")

        # B. Download ZIP
        resp_zip = await client.get("/api/v1/extension/download")
        assert resp_zip.status_code == 200
        assert len(resp_zip.content) > 500
        assert "application/zip" in resp_zip.headers.get("content-type", "")
        print(f"  -> Extension ZIP generated: {len(resp_zip.content)} bytes.")

        # C. Legacy /api/credibility-score compatibility route for browser extension popup
        resp_leg = await client.post("/api/credibility-score", json={
            "text": "NASA confirms Mars rover discovery of ancient organic carbon sediments in river delta.",
            "url": "https://bbc.com/news/science-12345"
        })
        assert resp_leg.status_code == 200
        leg_data = resp_leg.json()
        print(f"  -> Legacy Extension Scoring: Verdict={leg_data['verdict']}, Score={leg_data['credibility_score']}, Grade={leg_data['grade']}")
        assert "credibility_score" in leg_data
        print("  -> PASSED: Browser extension endpoints and legacy bridge verified.")

        # TEST 4: ANALYTICS DASHBOARD & CSV EXPORT
        print("\n[TEST 4] Testing User Analytics & CSV Audit Export...")
        # Authenticate Alice from Phase 2 / Phase 3
        login_resp = await client.post("/api/v1/auth/login", json={
            "username_or_email": "investigator_alice",
            "password": "PasswordAlice123!"
        })
        assert login_resp.status_code == 200
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Query analytics
        resp_analytics = await client.get("/api/v1/detect/analytics", headers=headers)
        assert resp_analytics.status_code == 200
        an_data = resp_analytics.json()
        print(f"  -> Alice's Analytics: Total Audits={an_data['total_audits']}, Real={an_data['real_count']}, Fake={an_data['fake_count']}, Modalities={an_data['modality_breakdown']}")

        # Export CSV
        resp_csv = await client.get("/api/v1/detect/export-csv", headers=headers)
        assert resp_csv.status_code == 200
        assert "text/csv" in resp_csv.headers.get("content-type", "")
        csv_lines = resp_csv.text.strip().split("\n")
        print(f"  -> CSV Header: {csv_lines[0]}")
        print(f"  -> Total CSV rows exported: {len(csv_lines)}")
        print("  -> PASSED: Analytics and personal CSV export verified.")

    print("\n" + "=" * 70)
    print(" ALL 4 PORTED FEATURE SUITES PASSED FLAWLESSLY! ")
    print("=" * 70)


if __name__ == "__main__":
    asyncio.run(run_port_tests())
