import React, { useRef, useEffect, useState, useCallback } from 'react';
import { DrawingState, Point, ToolType } from '../types';

interface CanvasProps {
  state: DrawingState;
  onColorPick: (color: string) => void;
  onSaveHistory: (data: ImageData) => void;
  undoStack: ImageData[];
  redoStack: ImageData[];
  setUndoStack: React.Dispatch<React.SetStateAction<ImageData[]>>;
  setRedoStack: React.Dispatch<React.SetStateAction<ImageData[]>>;
}

export const Canvas: React.FC<CanvasProps> = ({
  state,
  onColorPick,
  onSaveHistory,
  undoStack,
  redoStack,
  setUndoStack,
  setRedoStack,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [lastPoint, setLastPoint] = useState<Point | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (!canvas || !previewCanvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const pCtx = previewCanvas.getContext('2d');
    if (!ctx || !pCtx) return;

    // Set initial canvas size
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      
      // Save current content
      const tempImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      previewCanvas.width = parent.clientWidth;
      previewCanvas.height = parent.clientHeight;
      
      // Fill with white
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Restore content
      ctx.putImageData(tempImage, 0, 0);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Initial white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const getCoordinates = (e: React.PointerEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    const point = getCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Save state for undo
    onSaveHistory(ctx.getImageData(0, 0, canvas.width, canvas.height));

    setIsDrawing(true);
    setStartPoint(point);
    setLastPoint(point);

    ctx.beginPath();
    ctx.arc(point.x, point.y, state.brushSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = state.color;
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.strokeStyle = state.color;
    ctx.lineWidth = state.brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Capture pointer to continue receiving events even if mouse leaves canvas
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const point = getCoordinates(e);
    const canvas = canvasRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (!canvas || !previewCanvas) return;
    
    const ctx = canvas.getContext('2d');
    const pCtx = previewCanvas.getContext('2d');
    if (!ctx || !pCtx) return;

    // Always clear preview for cursor
    pCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

    if (isDrawing && lastPoint) {
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(point.x, point.y);
      ctx.strokeStyle = state.color;
      ctx.lineWidth = state.brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      setLastPoint(point);
    }

    // Draw cursor preview
    pCtx.beginPath();
    pCtx.arc(point.x, point.y, state.brushSize / 2, 0, Math.PI * 2);
    pCtx.strokeStyle = '#000000';
    pCtx.lineWidth = 1;
    pCtx.stroke();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    const point = getCoordinates(e);
    const canvas = canvasRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (!canvas || !previewCanvas) return;
    
    const ctx = canvas.getContext('2d');
    const pCtx = previewCanvas.getContext('2d');
    if (!ctx || !pCtx) return;

    pCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

    setIsDrawing(false);
    setStartPoint(null);
    setLastPoint(null);
    
    // Release pointer capture
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  return (
    <div className="relative w-full h-full bg-muted/30 overflow-hidden cursor-crosshair touch-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 shadow-lg touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
      <canvas
        ref={previewCanvasRef}
        className="absolute inset-0 pointer-events-none"
      />
    </div>
  );
};
