import asyncio
import io
import sys
from pathlib import Path
from PIL import Image

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


async def run_phase3_verification():
    print("=" * 70)
    print(" FACTORA MULTIMODAL - PHASE 3 ALL 4 MODALITIES VERIFICATION TEST")
    print("=" * 70)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Step 1: Login Alice (User 1)
        print("\n[STEP 1] Authenticating Alice...")
        login_resp = await client.post("/api/v1/auth/login", json={
            "username_or_email": "investigator_alice",
            "password": "PasswordAlice123!"
        })
        assert login_resp.status_code == 200, f"Alice login failed: {login_resp.text}"
        token_alice = login_resp.json()["access_token"]
        headers_alice = {"Authorization": f"Bearer {token_alice}"}
        print("  -> Alice authenticated successfully.")

        # Step 2: Login Bob (User 2)
        print("\n[STEP 2] Authenticating Bob...")
        login_resp = await client.post("/api/v1/auth/login", json={
            "username_or_email": "journalist_bob",
            "password": "PasswordBob123!"
        })
        assert login_resp.status_code == 200, f"Bob login failed: {login_resp.text}"
        token_bob = login_resp.json()["access_token"]
        headers_bob = {"Authorization": f"Bearer {token_bob}"}
        print("  -> Bob authenticated successfully.")

        # Step 3: Test Modality 1 - TEXT DETECTION
        print("\n[TEST 1] Testing POST /api/v1/detect/text (Text News + Google cross-check)...")
        text_payload = {
            "title": "NASA Confirms James Webb Telescope Discovers Atmospheric Water on Exoplanet",
            "text": (
                "NASA's James Webb Space Telescope has detected definitive molecular signatures of water vapor "
                "and sulfur dioxide in the atmosphere of exoplanet WASP-39 b. Peer-reviewed observations "
                "published in Nature confirm high-resolution transmission spectroscopy data gathered across multiple instruments."
            )
        }
        resp = await client.post("/api/v1/detect/text", json=text_payload, headers=headers_alice)
        assert resp.status_code == 201, f"Text detection failed: {resp.text}"
        text_res = resp.json()
        assert text_res["modality"] == "TEXT"
        assert text_res["verdict"] in ["REAL", "FAKE", "UNCERTAIN"]
        assert "confidence_score" in text_res
        assert len(text_res["reasoning"]) > 20
        assert "google_crosscheck" in text_res
        alice_text_record_id = text_res["id"]
        print(f"  -> Text Verdict: {text_res['verdict']} ({text_res['confidence_score']}%)")
        print(f"  -> Reasoning snippet: {text_res['reasoning'][:90]}...")

        # Step 4: Test Modality 2 - IMAGE DETECTION
        print("\n[TEST 2] Testing POST /api/v1/detect/image (Image ELA & Forensics)...")
        # Generate synthetic test image in memory
        img = Image.new("RGB", (200, 200), color=(182, 124, 98))
        img_buffer = io.BytesIO()
        img.save(img_buffer, format="JPEG", quality=85)
        img_bytes = img_buffer.getvalue()

        files = {"file": ("breaking_news_photo.jpg", img_bytes, "image/jpeg")}
        resp = await client.post("/api/v1/detect/image", files=files, headers=headers_alice)
        assert resp.status_code == 201, f"Image detection failed: {resp.text}"
        img_res = resp.json()
        assert img_res["modality"] == "IMAGE"
        assert img_res["verdict"] in ["REAL", "FAKE"]
        assert "error_level_analysis" in img_res["detailed_analysis"]
        alice_img_record_id = img_res["id"]
        print(f"  -> Image Verdict: {img_res['verdict']} ({img_res['confidence_score']}%)")
        print(f"  -> Reasoning: {img_res['reasoning'][:90]}...")

        # Step 5: Test Modality 3 - VIDEO DETECTION
        print("\n[TEST 3] Testing POST /api/v1/detect/video (Video Deepfake Forensics)...")
        dummy_video_bytes = b"\x00\x00\x00\x20ftypmp42\x00\x00\x00\x00isommp42" + (b"randomvideoframesdata" * 100)
        files = {"file": ("press_conference_leak.mp4", dummy_video_bytes, "video/mp4")}
        resp = await client.post("/api/v1/detect/video", files=files, headers=headers_alice)
        assert resp.status_code == 201, f"Video detection failed: {resp.text}"
        vid_res = resp.json()
        assert vid_res["modality"] == "VIDEO"
        assert vid_res["verdict"] in ["REAL", "FAKE"]
        alice_vid_record_id = vid_res["id"]
        print(f"  -> Video Verdict: {vid_res['verdict']} ({vid_res['confidence_score']}%)")
        print(f"  -> Reasoning: {vid_res['reasoning'][:90]}...")

        # Step 6: Test Modality 4 - AUDIO DETECTION
        print("\n[TEST 4] Testing POST /api/v1/detect/audio (Audio Synthetic Voice Clone Forensics)...")
        dummy_audio_bytes = b"ID3\x04\x00\x00\x00\x00\x00#TIT2\x00\x00\x00\x0f\x00\x00\x01\xff\xfeAudio Speech" + (b"\x00\x00\x55\xaa" * 100)
        files = {"file": ("leaked_phone_call.mp3", dummy_audio_bytes, "audio/mpeg")}
        resp = await client.post("/api/v1/detect/audio", files=files, headers=headers_alice)
        assert resp.status_code == 201, f"Audio detection failed: {resp.text}"
        aud_res = resp.json()
        assert aud_res["modality"] == "AUDIO"
        assert aud_res["verdict"] in ["REAL", "FAKE"]
        print(f"  -> Audio Verdict: {aud_res['verdict']} ({aud_res['confidence_score']}%)")
        print(f"  -> Reasoning: {aud_res['reasoning'][:90]}...")

        # Step 7: Test User History
        print("\n[TEST 5] Testing GET /api/v1/detect/history for Alice...")
        resp = await client.get("/api/v1/detect/history", headers=headers_alice)
        assert resp.status_code == 200
        alice_history = resp.json()
        assert alice_history["total"] >= 4, f"Expected at least 4 records for Alice, got {alice_history['total']}"
        print(f"  -> Alice has {alice_history['total']} records stored in her isolated database.")

        # Filter by modality
        resp_text = await client.get("/api/v1/detect/history?modality=TEXT", headers=headers_alice)
        assert resp_text.status_code == 200
        assert all(item["modality"] == "TEXT" for item in resp_text.json()["items"])
        print(f"  -> Filter by modality=TEXT successfully returned {resp_text.json()['total']} text items.")

        # Step 8: Strict User Data Privacy & Isolation Test
        print("\n[TEST 6] Testing STRICT Privacy: Bob queries Alice's record ID...")
        # Bob tries to access Alice's text record
        resp_bob_spy = await client.get(f"/api/v1/detect/record/{alice_text_record_id}", headers=headers_bob)
        assert resp_bob_spy.status_code == 404, f"SECURITY BREACH! Bob should get 404, got {resp_bob_spy.status_code}"
        print("  -> Access DENIED for unauthorized user (HTTP 404 Not Found in account). PASS!")

        # Bob checks his own history (should not contain Alice's records)
        resp_bob_hist = await client.get("/api/v1/detect/history", headers=headers_bob)
        bob_hist = resp_bob_hist.json()
        bob_ids = [item["id"] for item in bob_hist["items"]]
        assert alice_text_record_id not in bob_ids, "SECURITY BREACH! Alice record leaked in Bob history!"
        print(f"  -> Bob history contains {bob_hist['total']} records. Zero leakage from Alice. PASS!")

        # Step 9: User Feedback Submission
        print("\n[TEST 7] Testing POST /api/v1/detect/feedback...")
        feedback_payload = {
            "record_id": alice_text_record_id,
            "rating": 5,
            "feedback_text": "Accurately verified with Nature journal reference.",
            "suggested_verdict": "REAL"
        }
        resp = await client.post("/api/v1/detect/feedback", json=feedback_payload, headers=headers_alice)
        assert resp.status_code == 201, f"Feedback submission failed: {resp.text}"
        print(f"  -> Feedback submitted successfully for record #{alice_text_record_id}.")

    print("\n" + "=" * 70)
    print(" [ALL TESTS PASSED] Phase 3: 4 Modalities & Privacy 100% Operational!")
    print("=" * 70)
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(run_phase3_verification())
