import asyncio
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
from app.db.session import engine


async def run_phase4_verification():
    print("=" * 70)
    print(" FACTORA MULTIMODAL - PHASE 4 REACT FRONTEND & SPA INTEGRATION TEST")
    print("=" * 70)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Test 1: Verify SPA Index Delivery
        print("\n[TEST 1] Verifying GET / serves React Vite SPA index.html...")
        resp = await client.get("/")
        assert resp.status_code == 200, f"Failed to serve SPA index: {resp.status_code}"
        assert '<div id="root"></div>' in resp.text, "Root element missing from React index.html"
        assert "FacTora Multimodal" in resp.text, "Brand title missing in index.html"
        print("  -> GET / serves React SPA cleanly with #root mount point. PASS!")

        # Test 2: Verify Static Assets Mount
        print("\n[TEST 2] Verifying static assets mount (/assets)...")
        dist_assets = PROJECT_ROOT / "frontend" / "dist" / "assets"
        js_files = list(dist_assets.glob("*.js"))
        css_files = list(dist_assets.glob("*.css"))
        assert len(js_files) > 0, "No JS bundle found in dist/assets"
        assert len(css_files) > 0, "No CSS bundle found in dist/assets"

        js_name = js_files[0].name
        css_name = css_files[0].name

        resp_js = await client.get(f"/assets/{js_name}")
        assert resp_js.status_code == 200, f"Failed to fetch JS bundle: {resp_js.status_code}"
        print(f"  -> Successfully served JS bundle: /assets/{js_name} ({len(resp_js.content)} bytes). PASS!")

        resp_css = await client.get(f"/assets/{css_name}")
        assert resp_css.status_code == 200, f"Failed to fetch CSS bundle: {resp_css.status_code}"
        print(f"  -> Successfully served CSS bundle: /assets/{css_name} ({len(resp_css.content)} bytes). PASS!")

        # Test 3: SPA Fallback Routing
        print("\n[TEST 3] Verifying SPA route fallback (e.g. /dashboard, /history)...")
        resp_fallback = await client.get("/dashboard")
        assert resp_fallback.status_code == 200, f"Fallback routing failed: {resp_fallback.status_code}"
        assert '<div id="root"></div>' in resp_fallback.text, "Fallback didn't return SPA index.html"
        print("  -> SPA deep links fallback directly to index.html for client-side routing. PASS!")

        # Test 4: Health Check Endpoint
        print("\n[TEST 4] Verifying System Health Check (/health)...")
        resp_health = await client.get("/health")
        assert resp_health.status_code == 200, f"Health check failed: {resp_health.status_code}"
        health_data = resp_health.json()
        assert health_data["status"] == "healthy"
        print(f"  -> Health check status: {health_data['status']}, app: {health_data['app']}. PASS!")

        # Test 5: Full Frontend API Flow (Auth -> Detection -> History -> Feedback)
        print("\n[TEST 5] Testing Full Frontend API Flow (Auth -> Text Detect -> History -> Feedback)...")
        login_resp = await client.post("/api/v1/auth/login", json={
            "username_or_email": "investigator_alice",
            "password": "PasswordAlice123!"
        })
        assert login_resp.status_code == 200, "Alice login failed"
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Submit claim like frontend does
        claim_payload = {
            "title": "Clinical Trial on Herbal Compound",
            "text": "Preliminary laboratory research highlights antioxidant activity in green tea polyphenols under regulated in vitro assays."
        }
        detect_resp = await client.post("/api/v1/detect/text", json=claim_payload, headers=headers)
        assert detect_resp.status_code in (200, 201), f"Detection failed: {detect_resp.text}"
        rec = detect_resp.json()
        assert "verdict" in rec
        assert "confidence_score" in rec
        assert "reasoning" in rec
        print(f"  -> Analyzed text claim: Verdict={rec['verdict']}, Confidence={rec['confidence_score']}%")

        # Fetch history as HistoryDrawer does
        hist_resp = await client.get("/api/v1/detect/history", headers=headers)
        assert hist_resp.status_code == 200, "History fetch failed"
        hist_data = hist_resp.json()
        assert hist_data["total"] >= 1
        print(f"  -> HistoryDrawer fetched {hist_data['total']} user records cleanly.")

        # Submit feedback as VerdictDisplay does
        feedback_resp = await client.post("/api/v1/detect/feedback", json={
            "record_id": rec["id"],
            "rating": 5,
            "feedback_text": "Clean verification from frontend",
            "suggested_verdict": rec["verdict"]
        }, headers=headers)
        assert feedback_resp.status_code == 201, "Feedback failed"
        print("  -> Feedback posted successfully.")

    print("\n" + "=" * 70)
    print(" [ALL TESTS PASSED] Phase 4: React Vite Frontend & Full-Stack Integration Verified!")
    print("=" * 70)
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(run_phase4_verification())
