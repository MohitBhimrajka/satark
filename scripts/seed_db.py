# scripts/seed_db.py
"""
Satark — Baseline seed script.
Creates default admin and analyst users for development.
Run via: make seed
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.database import SessionLocal
from app.models.user import User
from app.services.auth import hash_password

SEED_USERS = [
    {
        "email": "admin@satark.gov.in",
        "password": "Admin@123",
        "display_name": "Admin User",
        "role": "admin",
    },
    {
        "email": "analyst@satark.gov.in",
        "password": "Analyst@123",
        "display_name": "Analyst User",
        "role": "analyst",
    },
]


def seed():
    db = SessionLocal()
    try:
        for user_data in SEED_USERS:
            existing = (
                db.query(User)
                .filter(User.email == user_data["email"])
                .first()
            )
            if existing:
                print(f"  [SKIP] {user_data['email']} already exists")
                continue

            user = User(
                email=user_data["email"],
                password_hash=hash_password(user_data["password"]),
                display_name=user_data["display_name"],
                role=user_data["role"],
            )
            db.add(user)
            print(f"  [CREATE] {user_data['email']} ({user_data['role']})")

        db.commit()
        print("\nSeed complete.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
