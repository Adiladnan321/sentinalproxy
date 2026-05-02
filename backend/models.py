from pydantic import BaseModel
from typing import Optional


class ChatRequest(BaseModel):
    prompt: str
    model: str = "gemini-2.5-flash-latest"


class ChatResponse(BaseModel):
    reply: str
    model_used: str
    masked_prompt: str
    pii_detected: bool
    mapping: dict
    raw_llm_reply: str


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    role: str
    user_id: str


class UserProfile(BaseModel):
    user_id: str
    username: str
    role: str
    allowed_models: list[str]
    query_limit: int          # -1 means unlimited
    queries_used_today: int
