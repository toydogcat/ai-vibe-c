import base64
import google.generativeai as genai
from config import GEMINI_API_KEY, GEMINI_MODEL
from models import AIDrawResponse

genai.configure(api_key=GEMINI_API_KEY)

async def generate_image(prompt: str, canvas_data: str = None, is_blank: bool = True) -> AIDrawResponse:
    """
    Generate or modify an image using Gemini API
    """
    try:
        prompt_text = (
            f"Generate a new image based on this prompt: {prompt}. Return ONLY the generated image."
            if is_blank
            else f"Modify this drawing based on this prompt: {prompt}. Return ONLY the modified image."
        )
        
        print(f"[DEBUG] Prompt: {prompt_text}")
        print(f"[DEBUG] Using model: {GEMINI_MODEL}")
        
        model = genai.GenerativeModel(GEMINI_MODEL)
        request_content = [prompt_text]
        
        if not is_blank and canvas_data:
            # Remove data URI prefix if present
            if ";" in canvas_data and "," in canvas_data:
                canvas_data = canvas_data.split(",")[1]
            
            request_content.insert(0, {
                "inline_data": {
                    "mime_type": "image/png",
                    "data": canvas_data
                }
            })
        
        response = model.generate_content(request_content)
        print(f"[DEBUG] Response: {response}")
        print(f"[DEBUG] Response dir: {dir(response)}")
        
        # Try to get image data from response
        image_data = None
        if hasattr(response, 'data'):
            image_data = response.data
            print(f"[DEBUG] Got data from response.data: {type(image_data)}")
        elif hasattr(response, '_result'):
            # Try to extract from internal result structure
            print(f"[DEBUG] Checking _result...")
            if response._result.candidates:
                parts = response._result.candidates[0].content.parts
                print(f"[DEBUG] Parts: {parts}")
                for part in parts:
                    print(f"[DEBUG] Part: {part}, type: {type(part)}")
                    if hasattr(part, 'inline_data') and hasattr(part.inline_data, 'data'):
                        image_data = part.inline_data.data
                        print(f"[DEBUG] Got image_data from part")
                        break
        
        if image_data:
            if isinstance(image_data, bytes):
                image_data = base64.b64encode(image_data).decode('utf-8')
            return AIDrawResponse(success=True, image_data=image_data)
        else:
            print(f"[DEBUG] No image data found in response")
            return AIDrawResponse(success=False, error="No image data in response")
    
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        import traceback
        traceback.print_exc()
        return AIDrawResponse(success=False, error=str(e))
