from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import ButtonEvent, AIDrawRequest, AIDrawResponse
from stats import button_stats
from ai_service import generate_image

app = FastAPI(title="AI Paint Backend")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/api/button-event")
async def track_button_event(event: ButtonEvent):
    """Record button click event"""
    button_stats.record_event(event.button_name, event.user_id)
    return {"success": True, "message": "Event recorded"}

@app.get("/api/button-stats")
async def get_button_stats():
    """Get button click statistics"""
    return {"stats": button_stats.get_stats()}

@app.get("/api/button-events")
async def get_button_events():
    """Get all button events"""
    return {"events": button_stats.get_events()}

@app.post("/api/ai-draw")
async def ai_draw(request: AIDrawRequest):
    """Generate or modify image using AI"""
    if not request.prompt or not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
    
    result = await generate_image(
        prompt=request.prompt,
        canvas_data=request.canvas_data,
        is_blank=request.is_blank
    )
    return result

@app.post("/api/reset-stats")
async def reset_stats():
    """Reset all statistics"""
    button_stats.reset_stats()
    return {"success": True, "message": "Stats reset"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
