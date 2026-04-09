import uvicorn
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import os

from models import ButtonEvent, AIDrawRequest, AIDrawResponse
from stats import button_stats
from ai_service import generate_image

app = FastAPI(title="AI Vibe C - Python Backend")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/api/button-event")
async def record_button_event(event: ButtonEvent):
    button_stats.record_event(event.button_name, event.user_id)
    return {"success": True, "message": "Event recorded"}

@app.get("/api/button-stats")
async def get_button_stats():
    return {"stats": button_stats.get_stats()}

@app.get("/api/button-events")
async def get_button_events():
    return {"events": button_stats.get_events()}

@app.post("/api/ai-draw", response_model=AIDrawResponse)
async def ai_draw(req: AIDrawRequest):
    if not req.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
    
    result = await generate_image(req.prompt, req.canvas_data, req.is_blank)
    return result

@app.post("/api/reset-stats")
async def reset_stats(password: str = Query(...)):
    admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
    if password != admin_password:
        raise HTTPException(status_code=401, detail="Invalid password")
    
    button_stats.reset_stats()
    return {"success": True, "message": "Statistics reset"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"🚀 Python Backend Server starting on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
