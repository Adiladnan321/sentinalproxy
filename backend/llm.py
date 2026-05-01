
import os
from google import genai
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

print("hu", os.getenv("GEMINI_API_KEY"))

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def call_llm(prompt: str, model: str) -> str:
    response = client.models.generate_content(
        model=model,
        contents=prompt
    )
    return response.text
