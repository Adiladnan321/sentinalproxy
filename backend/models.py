from pydantic import BaseModel

class ChatRequest(BaseModel):
    prompt: str
    model: str = "gemini-2.5-flash-latest"

class ChatResponse(BaseModel):
    reply: str
    model_used: str

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
