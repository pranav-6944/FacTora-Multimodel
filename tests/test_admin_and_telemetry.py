import asyncio
import os
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
from app.models.db_models import User
from app.core.security import get_password_hash
from sqlalchemy import select

async def run_admin_tests():
    print("=" * 70)
    print(" FACTORA MULTIMODAL - ADMIN PANEL & MODEL TELEMETRY VERIFICATION")
    print("=" * 70)

    # Initialize db tables if needed
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Login with Admin
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "admin", "password": "Admin1234!"}
        )
        assert login_resp.status_code == 200, f"Admin login failed: {login_resp.text}"
        admin_token = login_resp.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        print(" [OK] 1. Admin login successful. Role: admin")

        # 2. Test Admin Overview
        overview_resp = await client.get("/api/v1/admin/overview", headers=admin_headers)
        assert overview_resp.status_code == 200, f"Overview failed: {overview_resp.text}"
        overview_data = overview_resp.json()
        assert "total_users" in overview_data
        assert "total_audits" in overview_data
        assert "model_telemetry" in overview_data
        print(f" [OK] 2. Admin Overview: {overview_data['total_users']} users, {overview_data['total_audits']} audits, RSS RAM: {overview_data['model_telemetry']['current_process_ram_mb']} MB")

        # 3. Test Admin Users List
        users_resp = await client.get("/api/v1/admin/users", headers=admin_headers)
        assert users_resp.status_code == 200, f"Users failed: {users_resp.text}"
        users_data = users_resp.json()
        assert "users" in users_data
        assert len(users_data["users"]) > 0
        print(f" [OK] 3. Admin Users: {len(users_data['users'])} users retrieved")

        # 4. Test Admin Records List
        records_resp = await client.get("/api/v1/admin/records", headers=admin_headers)
        assert records_resp.status_code == 200, f"Records failed: {records_resp.text}"
        records_data = records_resp.json()
        assert "records" in records_data
        print(f" [OK] 4. Admin Records: {len(records_data['records'])} records retrieved")

        # 5. Test Admin Model Lifecycle Telemetry
        telemetry_resp = await client.get("/api/v1/admin/model-lifecycle", headers=admin_headers)
        assert telemetry_resp.status_code == 200, f"Telemetry failed: {telemetry_resp.text}"
        telemetry_data = telemetry_resp.json()
        assert "telemetry" in telemetry_data
        assert "current_process_ram_mb" in telemetry_data["telemetry"]
        print(f" [OK] 5. Genuine Hardware Telemetry: Current Process RSS RAM = {telemetry_data['telemetry']['current_process_ram_mb']} MB")

        # 6. Test Non-Admin Forbidden Access
        # Ensure test non-admin user exists
        async with AsyncSessionLocal() as session:
            stmt = select(User).where(User.username == "test_regular_investigator")
            result = await session.execute(stmt)
            reg_user = result.scalars().first()
            if not reg_user:
                reg_user = User(
                    username="test_regular_investigator",
                    email="regular@factora.test",
                    hashed_password=get_password_hash("RegularPass123!"),
                    role="user"
                )
                session.add(reg_user)
                await session.commit()

        reg_login = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "test_regular_investigator", "password": "RegularPass123!"}
        )
        assert reg_login.status_code == 200
        reg_token = reg_login.json()["access_token"]
        reg_headers = {"Authorization": f"Bearer {reg_token}"}

        forbidden_resp = await client.get("/api/v1/admin/overview", headers=reg_headers)
        assert forbidden_resp.status_code == 403, f"Expected 403, got {forbidden_resp.status_code}"
        print(" [OK] 6. Non-admin security check passed (HTTP 403 Forbidden)")

        # 7. Test Static Logo Asset Serving
        for asset in ["/Vertical_stacked_logo.png", "/Horizontal_stacked_logo.png", "/Logo.png"]:
            asset_resp = await client.get(asset)
            assert asset_resp.status_code == 200, f"Failed to serve {asset}: {asset_resp.status_code}"
            assert "image" in asset_resp.headers.get("content-type", "").lower(), f"Unexpected mime: {asset_resp.headers.get('content-type')}"
            print(f" [OK] 7. Static asset {asset} served with MIME: {asset_resp.headers.get('content-type')}")

    print("\n" + "=" * 70)
    print(" ALL 7 ADMIN & TELEMETRY TEST CHECKS PASSED PERFECTLY!")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(run_admin_tests())
