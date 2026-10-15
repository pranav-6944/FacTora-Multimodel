import asyncio
import sys
from pathlib import Path

# Fix Windows console encoding for UTF-8
if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Add project root to path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from app.core.config import settings
from app.db.session import engine, Base
from app.models.db_models import User, AnalysisRecord, UserFeedback
from sqlalchemy import inspect


async def init_database():
    """Initializes the dedicated isolated database and all tables."""
    print("=" * 60)
    print(" FACTORA MULTIMODAL - DATABASE INITIALIZATION RUNNER")
    print("=" * 60)
    print(f"Target Database URL: {settings.DATABASE_URL}")
    print(f"Target Database File: {settings.DATA_DIR / 'factora_multimodal.db'}")
    
    # Ensure data directory exists
    settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    print("\n[INIT] Creating database tables asynchronously...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Verify tables using inspector
    def inspect_tables(sync_conn):
        inspector = inspect(sync_conn)
        return inspector.get_table_names()

    async with engine.connect() as conn:
        tables = await conn.run_sync(inspect_tables)

    print("\n[OK] Database tables successfully created:")
    for tbl in tables:
        print(f"  * {tbl}")

    print("\n[SUCCESS] Verification complete: Database is isolated and ready for Phase 2!")
    print("=" * 60)
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(init_database())
