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
    conn.execute("""
        CREATE TABLE IF NOT EXISTS rate_limits (
            user_id TEXT PRIMARY KEY,
            date    TEXT NOT NULL,
            count   INTEGER NOT NULL
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS user_exceptions (
            user_id     TEXT NOT NULL,
            value       TEXT NOT NULL,
            should_mask INTEGER NOT NULL,
            entity_type TEXT DEFAULT 'CUSTOM',
            PRIMARY KEY (user_id, value)
        )
    """)
    # Ensure existing dbs get the column
    try:
        conn.execute("ALTER TABLE user_exceptions ADD COLUMN entity_type TEXT DEFAULT 'CUSTOM'")
    except sqlite3.OperationalError:
        pass
    
    conn.commit()
    conn.close()