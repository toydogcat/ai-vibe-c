from pydantic import BaseModel
from typing import Optional

class ButtonEvent(BaseModel):
    button_name: str
    timestamp: float
    user_id: Optional[str] = None

class ButtonStats(BaseModel):
    button_name: str
    count: int

class AIDrawRequest(BaseModel):
    prompt: str
    canvas_data: Optional[str] = None
    is_blank: bool = True

class AIDrawResponse(BaseModel):
    success: bool
    image_data: Optional[str] = None
    error: Optional[str] = None
