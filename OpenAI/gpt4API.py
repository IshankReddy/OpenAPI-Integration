from openai import OpenAI
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import os
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables
load_dotenv()
openai_api_key = os.getenv('OPENAI_API_KEY')

# Initialize FastAPI and OpenAI
app = FastAPI(title="Chat With Me API")
client = OpenAI()

# Add this after creating the FastAPI app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    message: str

@app.post("/chat")
async def chat_with_me(chat_message: ChatMessage):
    try:
        stream = client.chat.completions.create(
            model="gpt-4-turbo-preview",  # Updated to a valid model name
            messages=[{"role": "user", "content": chat_message.message}],
            stream=True,
        )
        
        # Create a generator function for streaming
        async def generate_response():
            for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    yield chunk.choices[0].delta.content

        return StreamingResponse(generate_response(), media_type="text/event-stream")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Welcome to Chat With Me API"}

# Add this if you want to run the file directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)