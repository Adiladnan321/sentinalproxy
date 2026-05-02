from fastapi import Depends, FastAPI, HTTPException, status
from auth import create_token, get_current_user
from rbac import check_model_access, check_rate_limit
from users import get_user, verify_password
from models import ChatRequest, ChatResponse, LoginRequest, LoginResponse
from llm import call_llm
from scanner import scan_and_mask, restore

app = FastAPI()

@app.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    user = get_user(request.username)
    if not user or not verify_password(request.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    token = create_token(user_id=user["user_id"], role=user["role"])
    return LoginResponse(access_token=token)

@app.post("/chat", response_model = ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user)
    ):
    check_model_access(current_user["role"], request.model)
    check_rate_limit(current_user["user_id"], current_user["role"])
    masked_prompt, mapping = scan_and_mask(request.prompt)

    raw_reply = call_llm(masked_prompt, request.model)
    reply = restore(raw_reply, mapping)
    return ChatResponse(reply=reply, model_used=request.model)

