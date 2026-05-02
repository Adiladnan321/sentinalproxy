from datetime import date

from fastapi import HTTPException, status


ROLE_MODEL_ACCESS = {
    "analyst":  [ "gemini-3.1-pro-preview","gemini-2.5-pro","gemini-2.5-flash-lite"],
    "engineer": ["gemini-1.5-flash", "gemini-1.5-pro"],
    "admin":    ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash"],
}

ROLE_QUERY_LIMITS = {
    "analyst":  50,
    "engineer": 200,
    "admin":    -1,
}

_query_counts: dict={}

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
    record = _query_counts.get(user_id)

    if record is None or record["date"] != today:
        _query_counts[user_id] = {"date": today, "count": 0}

    current = _query_counts[user_id]["count"]

    if current >= limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Role '{role}' has exceeded daily query limit of {limit}"
        )
    _query_counts[user_id]["count"] += 1

def get_query_limit(role: str) -> int:
    return ROLE_QUERY_LIMITS.get(role, 0)
