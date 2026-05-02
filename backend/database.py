import sqlite3
import os
from dotenv import load_dotenv

load_dotenv()
DB_PATH = os.getenv("DB_PATH", "sentinal.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS audit_log (
            id               INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp        TEXT    NOT NULL,
            user_id          TEXT    NOT NULL,
            role             TEXT    NOT NULL,
            model            TEXT    NOT NULL,
            masked_prompt    TEXT    NOT NULL,
            pii_detected     INTEGER NOT NULL,
            status           TEXT    NOT NULL,
            response_time_ms INTEGER NOT NULL
        )
    """)
    conn.commit()
    conn.close()