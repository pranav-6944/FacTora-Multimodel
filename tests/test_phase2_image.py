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
from app.services.image_detector import ImageDetectorService
from app.core.model_manager import model_manager


def _create_test_image_bytes(color: tuple = (200, 100, 50), size: tuple = (120, 120)) -> bytes:
    """Helper to generate in-memory synthetic JPEG image bytes."""
    img = Image.new("RGB", size, color=color)
    buffer = io.BytesIO()
    img.save(buffer, format="JPEG", quality=95)
    return buffer.getvalue()


async def test_ela_computation_and_heatmap():
    """Verify that ELA metrics and base64 heatmap image are accurately generated."""
    print("  [TEST 1] Testing ELA computation and heatmap generation...")
    img_bytes = _create_test_image_bytes()
    image = Image.open(io.BytesIO(img_bytes))

    metrics, heatmap_base64 = ImageDetectorService._calculate_ela(image)

    assert "mean_error" in metrics
    assert "stddev_error" in metrics
    assert "compression_anomaly_detected" in metrics
    assert heatmap_base64.startswith("data:image/png;base64,")
    assert len(heatmap_base64) > 100
    print(f"    ✓ ELA computed: mean={metrics['mean_error']}, stddev={metrics['stddev_error']}")
    print(f"    ✓ Heatmap data URL generated: {len(heatmap_base64)} chars")


async def test_analyze_image_pipeline():
    """Verify complete image verification pipeline including telemetry and detailed analysis."""
    print("  [TEST 2] Testing ImageDetectorService.analyze_image()...")
    img_bytes = _create_test_image_bytes()
    result = await ImageDetectorService.analyze_image(img_bytes, "synthetic_test.jpg")

    assert "verdict" in result
    assert result["verdict"] in ["REAL", "FAKE"]
    assert "confidence_score" in result
    assert 0.0 <= result["confidence_score"] <= 100.0
    assert "reasoning" in result

    detailed = result["detailed_analysis"]
    assert detailed["file_info"]["filename"] == "synthetic_test.jpg"
    assert detailed["ela_preview_base64"].startswith("data:image/png;base64,")
    assert "model_name" in detailed
    assert "probabilities" in detailed
    print(f"    ✓ Verdict: {result['verdict']} | Confidence: {result['confidence_score']}%")
    print(f"    ✓ Engine: {detailed['model_name']}")


async def test_vision_model_manager_lifecycle():
    """Verify ModelManager image context manager acquires lock and cleans up cleanly."""
    print("  [TEST 3] Testing ModelManager image RAM lifecycle...")
    async with model_manager.load_vision_model() as (proc, model):
        current = model_manager.get_current_telemetry()
        assert current["active_modality"] == "IMAGE"
        assert current["is_loaded"] is True
        print(f"    ✓ Modality in RAM: {current['active_modality']} | Process RSS: {current['current_process_ram_mb']} MB")

    # Post-context: active modality must be ejected and cleared
    after = model_manager.get_current_telemetry()
    assert after["active_modality"] is None
    assert after["is_loaded"] is False
    print("    ✓ Post-ejection: Model purged from RAM successfully")


async def test_api_detect_image_endpoint():
    """Verify HTTP multipart endpoint /api/v1/detect/image."""
    print("  [TEST 4] Testing POST /api/v1/detect/image endpoint...")
    img_bytes = _create_test_image_bytes()
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Sign up or login test investigator
        signup_payload = {
            "username": "vision_tester",
            "email": "vision_tester@factora.ai",
            "password": "PasswordVision123!"
        }
        login_res = await client.post("/api/v1/auth/signup", json=signup_payload)
        if login_res.status_code == 200:
            token = login_res.json()["access_token"]
        else:
            auth_res = await client.post("/api/v1/auth/login", json={
                "username_or_email": "vision_tester",
                "password": "PasswordVision123!"
            })
            token = auth_res.json()["access_token"]

        headers = {"Authorization": f"Bearer {token}"}
        files = {
            "file": ("forensic_sample.jpg", img_bytes, "image/jpeg")
        }

        response = await client.post("/api/v1/detect/image", headers=headers, files=files)
        assert response.status_code == 201

        data = response.json()
        assert data["modality"] == "IMAGE"
        assert data["verdict"] in ["REAL", "FAKE"]
        assert "confidence_score" in data
        assert "ela_preview_base64" in data["detailed_analysis"]
        assert data["detailed_analysis"]["ela_preview_base64"].startswith("data:image/png;base64,")
        print(f"    ✓ HTTP 201 Created | Verdict: {data['verdict']} | Score: {data['confidence_score']}%")
        print("    ✓ Base64 ELA preview attached in detailed_analysis")


async def main():
    print("=" * 70)
    print(" FACTORA MULTIMODAL — PHASE 2 IMAGE FORENSICS & ELA VERIFICATION")
    print("=" * 70)
    await test_ela_computation_and_heatmap()
    await test_analyze_image_pipeline()
    await test_vision_model_manager_lifecycle()
    await test_api_detect_image_endpoint()
    print("=" * 70)
    print(" ALL 4 PHASE 2 IMAGE TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 70)


if __name__ == "__main__":
    asyncio.run(main())
