import time
from datetime import date
from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.responses import PlainTextResponse
from dotenv import load_dotenv

load_dotenv()

from models import ChatRequest, ChatResponse, LoginRequest, LoginResponse, UserProfile, FeedbackRequest, ScanRequest, ScanResponse
from llm import call_llm
from scanner import scan_and_mask, restore, get_user_exceptions
from auth import create_token, get_current_user
from rbac import check_model_access, check_rate_limit, ROLE_MODEL_ACCESS, ROLE_QUERY_LIMITS
from users import get_user, verify_password, USERS
from database import init_db, get_connection
from audit import log_request, export_logs
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
init_db()   # creates the table if it doesn't exist

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Auth ─────────────────────────────────────────────────────

@app.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    user = get_user(request.username)
    if not user or not verify_password(request.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    token = create_token(request.username, user["user_id"], user["role"])
    return LoginResponse(
        access_token=token,
        username=request.username,
        role=user["role"],
        user_id=user["user_id"],
    )


# ── User Profile ────────────────────────────────────────────

@app.get("/me", response_model=UserProfile)
async def me(current_user: dict = Depends(get_current_user)):
    role = current_user["role"]
    user_id = current_user["user_id"]
    username = current_user.get("username", user_id)

    limit = ROLE_QUERY_LIMITS.get(role, 0)
    today = str(date.today())

    conn = get_connection()
    row = conn.execute(
        "SELECT date, count FROM rate_limits WHERE user_id = ?", (user_id,)
    ).fetchone()
    conn.close()

    queries_used = 0
    if row and row["date"] == today:
        queries_used = row["count"]

    return UserProfile(
        user_id=user_id,
        username=username,
        role=role,
        allowed_models=ROLE_MODEL_ACCESS.get(role, []),
        query_limit=limit,
        queries_used_today=queries_used,
    )


# ── Chat & Scanning ──────────────────────────────────────────

@app.post("/scan", response_model=ScanResponse)
async def scan(
    request: ScanRequest,
    current_user: dict = Depends(get_current_user)
):
    exceptions = get_user_exceptions(current_user["user_id"])
    masked_prompt, mapping = scan_and_mask(request.prompt, exceptions)
    return ScanResponse(
        masked_prompt=masked_prompt,
        mapping=mapping,
        pii_detected=len(mapping) > 0
    )


@app.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    check_model_access(current_user["role"], request.model)
    check_rate_limit(current_user["user_id"], current_user["role"])

    start = time.time()
    exceptions = get_user_exceptions(current_user["user_id"])
    masked_prompt, mapping = scan_and_mask(request.prompt, exceptions)
    pii_found = len(mapping) > 0                          

    try:
        raw_reply = call_llm(masked_prompt, request.model)
        reply = restore(raw_reply, mapping)
        response_time = int((time.time() - start) * 1000)

        log_request(                                       
            user_id=current_user["user_id"],
            role=current_user["role"],
            model=request.model,
            masked_prompt=masked_prompt,
            pii_detected=pii_found,
            status="success",
            response_time_ms=response_time
        )
        return ChatResponse(
            reply=reply,
            model_used=request.model,
            masked_prompt=masked_prompt,
            pii_detected=pii_found,
            mapping=mapping,
            raw_llm_reply=raw_reply,
        )

    except Exception as e:
        response_time = int((time.time() - start) * 1000)
        log_request(                                       
            user_id=current_user["user_id"],
            role=current_user["role"],
            model=request.model,
            masked_prompt=masked_prompt,
            pii_detected=pii_found,
            status=f"error: {str(e)}",
            response_time_ms=response_time
        )
        raise HTTPException(status_code=500, detail=str(e))


# ── Feedback (user exceptions) ───────────────────────────────

@app.post("/feedback")
async def feedback(
    body: FeedbackRequest,
    current_user: dict = Depends(get_current_user)
):
    conn = get_connection()
    conn.execute("""
        INSERT INTO user_exceptions (user_id, value, should_mask, entity_type)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(user_id, value) DO UPDATE SET 
            should_mask=excluded.should_mask,
            entity_type=excluded.entity_type
    """, (current_user["user_id"], body.value, int(body.should_mask), body.entity_type))
    conn.commit()
    conn.close()
    return {"status": "saved"}


@app.get("/exceptions")
async def list_exceptions(
    current_user: dict = Depends(get_current_user)
):
    exceptions = get_user_exceptions(current_user["user_id"])
    return {"exceptions": [{"value": k, "should_mask": v["should_mask"], "entity_type": v["entity_type"]} for k, v in exceptions.items()]}


@app.delete("/exceptions/{value}")
async def delete_exception(
    value: str,
    current_user: dict = Depends(get_current_user)
):
    conn = get_connection()
    conn.execute(
        "DELETE FROM user_exceptions WHERE user_id = ? AND value = ?",
        (current_user["user_id"], value)
    )
    conn.commit()
    conn.close()
    return {"status": "deleted"}


# ── Export (admin only) ──────────────────────────────────────

@app.get("/export")
async def export(
    fmt: str = Query(default="json", enum=["json", "csv"]),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can export audit logs"
        )
    content = export_logs(fmt)
    media_type = "text/csv" if fmt == "csv" else "application/json"
    return PlainTextResponse(content=content, media_type=media_type)