import csv
import io
import json
from datetime import datetime, timezone
from database import get_connection

def log_request(
    user_id: str,
    role: str,
    model: str,
    masked_prompt: str,
    pii_detected: bool,
    status: str,
    response_time_ms: int      
):
    conn = get_connection()
    conn.execute("""
                  INSERT INTO audit_log
            (timestamp, user_id, role, model, masked_prompt, pii_detected, status, response_time_ms)
        VALUES
            (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        datetime.now(timezone.utc).isoformat(),
        user_id,
        role,
        model,
        masked_prompt,
        int(pii_detected),
        status,
        response_time_ms
        ))
    conn.commit()
    conn.close()


def export_logs(fmt: str = "json") -> str:
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM audit_log ORDER BY timestamp DESC"
    ).fetchall()
    conn.close()

    if fmt == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["id","timestamp","user_id","role","model",
                         "masked_prompt","pii_detected","status","response_time_ms"])
        for row in rows:
            writer.writerow(list(row))
        return output.getvalue()

    # default: json
    return json.dumps([dict(row) for row in rows], indent=2)