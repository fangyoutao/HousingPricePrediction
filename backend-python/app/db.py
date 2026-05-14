import os
import json
import aiosqlite
from datetime import datetime, timezone

DB_PATH = os.environ.get("DB_PATH", os.path.join(os.path.dirname(__file__), "history.db"))

_CREATE_SQL = """
CREATE TABLE IF NOT EXISTS predictions (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    features  TEXT    NOT NULL,
    price     REAL    NOT NULL,
    created_at TEXT   NOT NULL
)
"""


async def init_db() -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(_CREATE_SQL)
        await db.commit()


async def save_prediction(features: dict, price: float) -> int:
    now = datetime.now(timezone.utc).isoformat()
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            "INSERT INTO predictions (features, price, created_at) VALUES (?, ?, ?)",
            (json.dumps(features), price, now),
        )
        await db.commit()
        return cursor.lastrowid


async def get_history(limit: int = 50) -> list[dict]:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT id, features, price, created_at FROM predictions ORDER BY id DESC LIMIT ?",
            (limit,),
        )
        rows = await cursor.fetchall()
    return [
        {
            "id": r["id"],
            "features": json.loads(r["features"]),
            "predicted_price": r["price"],
            "created_at": r["created_at"],
        }
        for r in rows
    ]
