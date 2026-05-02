from datetime import date

from fastapi import HTTPException, status
from database import get_connection

ROLE_MODEL_ACCESS = {
    "analyst":  [ "gemini-2.5-flash-lite","gemini-3.1-pro-preview"],
    "engineer": ["gemini-1.5-flash", "gemini-1.5-pro"],
    "admin":    ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash"],
}

ROLE_QUERY_LIMITS = {
    "analyst":  50,
    "engineer": 200,
    "admin":    -1,
}

def check_model_access( role: str, model: str) -> bool:
    allowed = ROLE_MODEL_ACCESS.get(role, [])
    if model not in allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Role '{role}' cannot access model '{model}'"
        )

def check_rate_limit(user_id: str, role: str) -> bool:
    limit = ROLE_QUERY_LIMITS.get(role, 0)

    if limit == -1:
        return 
    
    today = str(date.today())
    conn = get_connection()
    
    row = conn.execute(
        "SELECT date, count FROM rate_limits WHERE user_id = ?", (user_id,)
    ).fetchone()

    if row is None or row["date"] != today:
        current = 0
        conn.execute(
            "INSERT OR REPLACE INTO rate_limits (user_id, date, count) VALUES (?, ?, ?)",
            (user_id, today, current + 1)
        )
    else:
        current = row["count"]
        if current >= limit:
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Role '{role}' has exceeded daily query limit of {limit}"
            )
        conn.execute(
            "UPDATE rate_limits SET count = count + 1 WHERE user_id = ?",
            (user_id,)
        )
    
    conn.commit()
    conn.close()

def get_query_limit(role: str) -> int:
    return ROLE_QUERY_LIMITS.get(role, 0)
