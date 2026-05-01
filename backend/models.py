from pydantic import BaseModel

class ChatRequest(BaseModel):
    prompt: str
    model: str = "gpt-4o-mini"

class ChatResponse(BaseModel):
    reply: str
    model_used: str

    