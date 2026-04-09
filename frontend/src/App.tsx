import { useState, useCallback, useEffect } from 'react';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { ColorPalette, BrushSettings } from './components/Controls';
import { DrawingState } from './types';
import { TooltipProvider } from './components/ui/tooltip';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { Sparkles, Loader2, Trash2, Lock, Unlock } from 'lucide-react';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';
const ADMIN_PASSWORD = (import.meta as any).env?.VITE_ADMIN_PASSWORD || 'admin123';

async function trackButtonEvent(buttonName: string) {
  try {
    await fetch(`${API_URL}/api/button-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        button_name: buttonName,
        timestamp: Date.now() / 1000
      })
    });
  } catch (error) {
    console.error('Failed to track button:', error);
  }
}

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
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);

  const handleColorChange = (color: string) => {
    trackButtonEvent('color_changed');
    setState(prev => ({ ...prev, color }));
  };

  const handleSizeChange = (brushSize: number) => {
    trackButtonEvent('brush_size_changed');
    setState(prev => ({ ...prev, brushSize }));
  };

  const saveToLocalStorage = useCallback(() => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (canvas) {
      localStorage.setItem('saved_drawing', canvas.toDataURL());
    }
  }, []);

  const saveHistory = useCallback((data: ImageData) => {
    setUndoStack(prev => [...prev.slice(-19), data]);
    setRedoStack([]);
    setTimeout(saveToLocalStorage, 100);
  }, [saveToLocalStorage]);

  const handleUndo = () => {
    trackButtonEvent('undo');
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
    trackButtonEvent('redo');
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
    trackButtonEvent('download');
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `ai-paint-${new Date().getTime()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleUpload = (file: File) => {
    trackButtonEvent('upload');
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.querySelector('canvas') as HTMLCanvasElement;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;
        
        saveHistory(ctx.getImageData(0, 0, canvas.width, canvas.height));
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        saveToLocalStorage();
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const clearCanvas = () => {
    trackButtonEvent('clear_canvas');
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    saveHistory(ctx.getImageData(0, 0, canvas.width, canvas.height));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToLocalStorage();
  };

  const isCanvasBlank = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return true;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255 || data[i + 3] !== 255) {
        return false;
      }
    }
    return true;
  };

  const handleAIDraw = async () => {
    if (!aiPrompt.trim()) return;
    trackButtonEvent('ai_draw');
    
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const blank = isCanvasBlank(canvas);

    setIsAiLoading(true);
    try {
      const canvasData = blank ? null : canvas.toDataURL('image/png').split(',')[1];
      
      const response = await fetch(`${API_URL}/api/ai-draw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          canvas_data: canvasData,
          is_blank: blank
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.image_data) {
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
        img.src = `data:image/png;base64,${result.image_data}`;
      } else {
        alert(`AI Error: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('AI Error:', error);
      alert(`Failed to generate image: ${error}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAdminToggle = () => {
    trackButtonEvent('admin_toggle');
    if (isAdminUnlocked) {
      setIsAdminUnlocked(false);
      setAdminPassword('');
    } else {
      setShowPasswordPrompt(true);
    }
  };

  const handlePasswordSubmit = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdminUnlocked(true);
      setShowPasswordPrompt(false);
      setAdminPassword('');
    } else {
      alert('Incorrect password');
      setAdminPassword('');
    }
  };

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
        {/* Password Prompt Modal */}
        {showPasswordPrompt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-lg shadow-lg">
              <h2 className="text-lg font-bold mb-4">Admin Password</h2>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                placeholder="Enter password"
                className="w-64 px-3 py-2 border rounded mb-4 text-xs"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="outline" onClick={() => setShowPasswordPrompt(false)}>Cancel</Button>
                <Button size="sm" onClick={handlePasswordSubmit}>Unlock</Button>
              </div>
            </div>
          </div>
        )}

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
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-2 shrink-0"
                onClick={clearCanvas}
              >
                <Trash2 className="h-3 w-3" />
                Clear
              </Button>
            </div>
            <div className="ml-auto">
              <Button
                size="sm"
                variant={isAdminUnlocked ? "default" : "outline"}
                className="h-8 gap-2"
                onClick={handleAdminToggle}
              >
                {isAdminUnlocked ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                {isAdminUnlocked ? 'Unlocked' : '***'}
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
