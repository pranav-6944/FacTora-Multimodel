import sqlite3
import sys
from pathlib import Path

# Add project root to path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from app.core.security import get_password_hash

db_path = PROJECT_ROOT / "data" / "factora_multimodal.db"
conn = sqlite3.connect(str(db_path))
c = conn.cursor()

# Promote alice to admin
c.execute("UPDATE users SET role='admin' WHERE username='investigator_alice'")

# Check if admin user exists
c.execute("SELECT id FROM users WHERE username='admin'")
row = c.fetchone()
if not row:
    hashed = get_password_hash("Admin1234!")
    c.execute(
        "INSERT INTO users (username, email, hashed_password, is_active, role) VALUES (?, ?, ?, ?, ?)",
        ("admin", "admin@factora.org", hashed, 1, "admin")
    )
    print("Created dedicated admin account: 'admin' / 'Admin1234!'")
else:
    c.execute("UPDATE users SET role='admin' WHERE username='admin'")
    print("Ensured role='admin' for existing admin user")

conn.commit()

c.execute("SELECT id, username, email, role FROM users")
print("Current user registry:", c.fetchall())
conn.close()
