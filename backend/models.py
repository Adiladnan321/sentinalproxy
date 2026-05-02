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


class FeedbackRequest(BaseModel):
    value: str          # the original word e.g. "Dubai"
    should_mask: bool   # false = never mask this again
    entity_type: str = "CUSTOM"


class ScanRequest(BaseModel):
    prompt: str


class ScanResponse(BaseModel):
    masked_prompt: str
    mapping: dict
    pii_detected: bool
