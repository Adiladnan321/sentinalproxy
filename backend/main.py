import time
from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.responses import PlainTextResponse
from dotenv import load_dotenv

load_dotenv()

from models import ChatRequest, ChatResponse, LoginRequest, LoginResponse
from llm import call_llm
from scanner import scan_and_mask, restore
from auth import create_token, get_current_user
from rbac import check_model_access, check_rate_limit
from users import get_user, verify_password
from database import init_db
from audit import log_request, export_logs
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
init_db()   # creates the table if it doesn't exist

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    user = get_user(request.username)
    if not user or not verify_password(request.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    token = create_token(user["user_id"], user["role"])
    return LoginResponse(access_token=token)


@app.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    check_model_access(current_user["role"], request.model)
    check_rate_limit(current_user["user_id"], current_user["role"])

    start = time.time()                                    
    masked_prompt, mapping = scan_and_mask(request.prompt)
    print("--- MASKED PROMPT ---")
    print(masked_prompt)
    print("--- MAPPING ---")
    print(mapping)
    print("---------------------")
    pii_found = len(mapping) > 0                          

    try:
        raw_reply = call_llm(masked_prompt, request.model)
        print("--- RAW LLM REPLY (before restore) ---")
        print(raw_reply)
        print("---------------------------------------")
        reply = restore(raw_reply, mapping)
        print(reply, "reply")
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
        return ChatResponse(reply=reply, model_used=request.model)

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