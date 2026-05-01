from fastapi import FastAPI
from models import ChatRequest, ChatResponse
from llm import call_llm
from scanner import scan_and_mask, restore

app = FastAPI()

@app.post("/chat", response_model = ChatResponse)
async def chat(request: ChatRequest):
    masked_prompt, mapping = scan_and_mask(request.prompt)

    raw_reply = call_llm(masked_prompt, request.model)
    reply = restore(raw_reply, mapping)
    return ChatResponse(reply=reply, model_used=request.model)

