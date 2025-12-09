"""
Utility: Convert crawled reviews JSON into SQL insert statements for users/girls/reviews.

Assumptions:
- We create ONE dummy girl record to satisfy FK (since schema requires girlId).
- We create one user per reviewer (email auto-generated).
- Password is a placeholder ("imported"), adjust if needed.
- Status set to APPROVED.

Usage:
    python reviews_to_sql.py path/to/reviews.json > seed_reviews.sql
"""

import json
import sys
import uuid
import re
from datetime import datetime

# Ensure UTF-8 stdout to avoid UnicodeEncodeError on Windows cp1252
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass


def slugify_email(name: str) -> str:
    base = re.sub(r"[^a-zA-Z0-9]+", ".", name).strip(".").lower() or "user"
    return f"{base}@import.local"


def main():
    if len(sys.argv) < 2:
        print("Usage: python reviews_to_sql.py path/to/reviews.json", file=sys.stderr)
        sys.exit(1)

    path = sys.argv[1]
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

    # One dummy user for all reviews (tên tiếng Việt)
    dummy_user_id = str(uuid.uuid4())
    dummy_user_email = "nhap.khau@import.local"
    dummy_user_name = "Người dùng nhập khẩu"
    inserts_users = [
        "INSERT INTO users (id, email, password, role, fullName, isActive, createdAt, updatedAt) "
        f"VALUES ('{dummy_user_id}', '{dummy_user_email}', 'imported', 'CUSTOMER', "
        f"'{dummy_user_name}', 1, '{now}', '{now}');"
    ]
    inserts_reviews = []

    # Dummy girl to satisfy NOT NULL / FK on girlId
    dummy_girl_id = str(uuid.uuid4())
    dummy_girl_name = "Gái gọi nhập khẩu"
    dummy_girl_slug = "gai-goi-nhap-khau"
    inserts_girl = (
        "INSERT INTO girls (id, name, slug, createdAt, updatedAt) "
        f"VALUES ('{dummy_girl_id}', '{dummy_girl_name}', '{dummy_girl_slug}', '{now}', '{now}');"
    )

    for item in data:
        user_id = dummy_user_id
        review_id = str(uuid.uuid4())
        title_raw = (item.get("content") or "Review")
        title = title_raw.split(".")[0][:100] or "Review"
        title = title.replace("'", "''")
        content = (item.get("content") or "").replace("'", "''")
        rating = int(item.get("rating") or 0) or 5
        images = json.dumps(item.get("images") or [], ensure_ascii=False)
        esc_images = images.replace("'", "''")

        inserts_reviews.append(
            "INSERT INTO reviews (id, customerId, girlId, title, content, rating, images, status, createdAt, updatedAt) "
            f"VALUES ('{review_id}', '{user_id}', '{dummy_girl_id}', '{title}', "
            f"'{content}', {rating}, '{esc_images}', 'APPROVED', '{now}', '{now}');"
        )

    print("-- Girl (dummy)")
    print(inserts_girl)

    print("\n-- Users (dummy)")
    for sql in inserts_users:
        print(sql)
    print("\n-- Reviews")
    for sql in inserts_reviews:
        print(sql)


if __name__ == "__main__":
    main()

