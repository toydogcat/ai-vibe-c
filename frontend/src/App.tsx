import { useState, useCallback, useEffect } from 'react';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { ColorPalette, BrushSettings } from './components/Controls';
import { DrawingState } from './types';
import { TooltipProvider } from './components/ui/tooltip';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// Initialize AI lazily to avoid issues if key is missing at load time
let ai: GoogleGenAI | null = null;
const getAI = () => {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing");
      return null;
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

export default function App() {
  const [state, setState] = useState<DrawingState>({
    tool: 'brush',
    color: '#000000',
    brushSize: 5,
    isDrawing: false,
    startPoint: null,
  });

  const [undoStack, setUndoStack] = useState<ImageData[]>([]);
  const [redoStack, setRedoStack] = useState<ImageData[]>([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleColorChange = (color: string) => {
    setState(prev => ({ ...prev, color }));
  };

  const handleSizeChange = (brushSize: number) => {
    setState(prev => ({ ...prev, brushSize }));
  };

  const saveToLocalStorage = useCallback(() => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (canvas) {
      localStorage.setItem('saved_drawing', canvas.toDataURL());
    }
  }, []);

  const saveHistory = useCallback((data: ImageData) => {
    setUndoStack(prev => [...prev.slice(-19), data]); // Keep last 20 steps
    setRedoStack([]);
    // Save to local storage after a short delay to ensure canvas is updated
    setTimeout(saveToLocalStorage, 100);
  }, [saveToLocalStorage]);

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setRedoStack(prev => [...prev, currentState]);

    const lastState = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    ctx.putImageData(lastState, 0, 0);
    saveToLocalStorage();
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;

    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setUndoStack(prev => [...prev, currentState]);

    const nextState = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    ctx.putImageData(nextState, 0, 0);
    saveToLocalStorage();
  };

  const handleDownload = () => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `ai-paint-${new Date().getTime()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.querySelector('canvas') as HTMLCanvasElement;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;
        
        saveHistory(ctx.getImageData(0, 0, canvas.width, canvas.height));
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        saveToLocalStorage();
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAIDraw = async () => {
    if (!aiPrompt.trim()) return;
    
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    const aiInstance = getAI();
    if (!aiInstance) {
      alert("AI is not configured. Please check your API key.");
      return;
    }

    setIsAiLoading(true);
    try {
      const base64Image = canvas.toDataURL('image/png').split(',')[1];
      
      const response = await aiInstance.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: {
          parts: [
            { inlineData: { data: base64Image, mimeType: "image/png" } },
            { text: `Modify this drawing based on this prompt: ${aiPrompt}. Return ONLY the modified image.` }
          ]
        }
      });

      const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      
      if (imagePart?.inlineData?.data) {
        const img = new Image();
        img.onload = () => {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            saveHistory(ctx.getImageData(0, 0, canvas.width, canvas.height));
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            saveToLocalStorage();
          }
        };
        img.src = `data:image/png;base64,${imagePart.inlineData.data}`;
      }
    } catch (error) {
      console.error('AI Error:', error);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoStack, redoStack]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('saved_drawing');
    if (saved) {
      const img = new Image();
      img.onload = () => {
        const canvas = document.querySelector('canvas') as HTMLCanvasElement;
        const ctx = canvas?.getContext('2d');
        if (ctx) ctx.drawImage(img, 0, 0);
      };
      img.src = saved;
    }
  }, []);

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen w-screen bg-background overflow-hidden font-sans">
        {/* Header - Brush Settings & AI */}
        <header className="flex items-center justify-between px-4 py-2 border-b bg-card shadow-sm z-10">
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-sm font-bold tracking-tight uppercase shrink-0">AI Paint</h1>
            <div className="w-px h-4 bg-border shrink-0" />
            <BrushSettings 
              size={state.brushSize}
              onSizeChange={handleSizeChange}
            />
            <div className="w-px h-4 bg-border shrink-0" />
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Input 
                placeholder="Ask AI to draw..." 
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="h-8 text-xs"
                onKeyDown={(e) => e.key === 'Enter' && handleAIDraw()}
              />
              <Button 
                size="sm" 
                className="h-8 gap-2 shrink-0" 
                onClick={handleAIDraw}
                disabled={isAiLoading}
              >
                {isAiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                AI Draw
              </Button>
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Toolbar */}
          <Toolbar 
            onUndo={handleUndo}
            onRedo={handleRedo}
            onDownload={handleDownload}
            onUpload={handleUpload}
            canUndo={undoStack.length > 0}
            canRedo={redoStack.length > 0}
          />

          {/* Main Content Area */}
          <div className="flex flex-col flex-1 relative bg-muted/20">
            {/* Canvas Area */}
            <main className="flex-1 p-8 flex items-center justify-center overflow-auto">
              <div className="w-full h-full max-w-5xl max-h-[80vh] shadow-2xl border-8 border-card rounded-sm overflow-hidden bg-white">
                <Canvas 
                  state={state}
                  onColorPick={handleColorChange}
                  onSaveHistory={saveHistory}
                  undoStack={undoStack}
                  redoStack={redoStack}
                  setUndoStack={setUndoStack}
                  setRedoStack={setRedoStack}
                />
              </div>
            </main>

            {/* Bottom Bar - Color Palette */}
            <div className="p-4 border-t bg-card">
              <ColorPalette 
                currentColor={state.color}
                onColorChange={handleColorChange}
              />
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
