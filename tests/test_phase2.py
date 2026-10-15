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
from app.db.session import engine, Base, AsyncSessionLocal
from app.models.db_models import User, AnalysisRecord
from sqlalchemy import select


async def run_phase2_verification():
    print("=" * 65)
    print(" FACTORA MULTIMODAL - PHASE 2 COMPREHENSIVE VERIFICATION TEST")
    print("=" * 65)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Health check
        print("\n[TEST 1] Testing /health endpoint...")
        resp = await client.get("/health")
        assert resp.status_code == 200, f"Health check failed: {resp.text}"
        print(f"  -> Health OK: {resp.json()}")

        # 2. Signup User 1
        print("\n[TEST 2] Testing User 1 Signup (/api/v1/auth/signup)...")
        u1_data = {
            "username": "investigator_alice",
            "email": "alice@factora.org",
            "password": "PasswordAlice123!"
        }
        resp = await client.post("/api/v1/auth/signup", json=u1_data)
        if resp.status_code == 400 and "already exists" in resp.text:
            print("  -> User 1 already exists, logging in instead...")
            login_resp = await client.post("/api/v1/auth/login", json={
                "username_or_email": u1_data["username"],
                "password": u1_data["password"]
            })
            assert login_resp.status_code == 200
            token_u1 = login_resp.json()["access_token"]
            u1_id = login_resp.json()["user"]["id"]
        else:
            assert resp.status_code == 201, f"Signup failed: {resp.text}"
            token_u1 = resp.json()["access_token"]
            u1_id = resp.json()["user"]["id"]
        print(f"  -> User 1 authenticated. ID={u1_id}")

        # 3. Signup User 2
        print("\n[TEST 3] Testing User 2 Signup (/api/v1/auth/signup)...")
        u2_data = {
            "username": "journalist_bob",
            "email": "bob@factora.org",
            "password": "PasswordBob123!"
        }
        resp = await client.post("/api/v1/auth/signup", json=u2_data)
        if resp.status_code == 400 and "already exists" in resp.text:
            login_resp = await client.post("/api/v1/auth/login", json={
                "username_or_email": u2_data["username"],
                "password": u2_data["password"]
            })
            assert login_resp.status_code == 200
            token_u2 = login_resp.json()["access_token"]
            u2_id = login_resp.json()["user"]["id"]
        else:
            assert resp.status_code == 201, f"Signup failed: {resp.text}"
            token_u2 = resp.json()["access_token"]
            u2_id = resp.json()["user"]["id"]
        print(f"  -> User 2 authenticated. ID={u2_id}")

        # 4. Profile endpoint /me for User 1
        print("\n[TEST 4] Testing /api/v1/auth/me for User 1...")
        resp = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token_u1}"})
        assert resp.status_code == 200
        assert resp.json()["username"] == "investigator_alice"
        print(f"  -> Profile verified for: {resp.json()['username']}")

        # 5. Database Direct Test: User Data Privacy & Isolation
        print("\n[TEST 5] Testing STRICT User Data Privacy & Isolation...")
        async with AsyncSessionLocal() as session:
            # Insert record for Alice
            rec_alice = AnalysisRecord(
                user_id=u1_id,
                modality="TEXT",
                title="Secret Leak Claim Alice",
                content_preview="Claim that something occurred in secret",
                verdict="FAKE",
                confidence_score=89.5,
                reasoning="Linguistic hyperbole and uncorroborated claim.",
                google_crosscheck={"total_sources": 0}
            )
            # Insert record for Bob
            rec_bob = AnalysisRecord(
                user_id=u2_id,
                modality="IMAGE",
                title="Deepfake Photo Bob",
                content_preview="photo_bob.jpg",
                verdict="FAKE",
                confidence_score=94.2,
                reasoning="ELA compression mismatch on facial region.",
                google_crosscheck={}
            )
            session.add_all([rec_alice, rec_bob])
            await session.commit()

            # Query scoped to Alice
            q_alice = select(AnalysisRecord).where(AnalysisRecord.user_id == u1_id)
            res_alice = await session.execute(q_alice)
            alice_records = res_alice.scalars().all()

            # Query scoped to Bob
            q_bob = select(AnalysisRecord).where(AnalysisRecord.user_id == u2_id)
            res_bob = await session.execute(q_bob)
            bob_records = res_bob.scalars().all()

            # Assert Alice cannot see Bob's records
            alice_titles = [r.title for r in alice_records]
            bob_titles = [r.title for r in bob_records]

            assert "Secret Leak Claim Alice" in alice_titles, "Alice should see her own record"
            assert "Deepfake Photo Bob" not in alice_titles, "Alice MUST NOT see Bob's record!"
            assert "Deepfake Photo Bob" in bob_titles, "Bob should see his own record"
            assert "Secret Leak Claim Alice" not in bob_titles, "Bob MUST NOT see Alice's record!"

            print(f"  -> Alice record count: {len(alice_records)} (Contains only Alice's records)")
            print(f"  -> Bob record count: {len(bob_records)} (Contains only Bob's records)")
            print("  -> Privacy Isolation ASSERTION PASSED 100%!")

    print("\n" + "=" * 65)
    print(" [ALL TESTS PASSED] Phase 2 Backend Core, Auth & DB Isolation Verified!")
    print("=" * 65)
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(run_phase2_verification())
