export type ToolType = 'brush';

export interface Point {
  x: number;
  y: number;
}

export interface DrawingState {
  tool: ToolType;
  color: string;
  brushSize: number;
  isDrawing: boolean;
  startPoint: Point | null;
}
