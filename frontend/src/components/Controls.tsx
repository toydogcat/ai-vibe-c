import React from 'react';
import { Slider } from './ui/slider';
import { Label } from './ui/label';

interface BrushSettingsProps {
  size: number;
  onSizeChange: (size: number) => void;
}

export const BrushSettings: React.FC<BrushSettingsProps> = ({ size, onSizeChange }) => {
  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-card border-b shadow-sm">
      <div className="flex items-center gap-3 w-64">
        <Label htmlFor="brush-size" className="text-xs font-medium whitespace-nowrap">Brush Size</Label>
        <Slider
          id="brush-size"
          min={1}
          max={50}
          step={1}
          value={[size]}
          onValueChange={(vals) => onSizeChange(vals[0])}
          className="flex-1"
        />
        <span className="text-xs font-mono w-6 text-right">{size}</span>
      </div>
      
      <div className="flex items-center gap-2 ml-4">
        <div 
          className="rounded-full border bg-foreground" 
          style={{ 
            width: Math.max(2, (size || 0) / 2) || 2, 
            height: Math.max(2, (size || 0) / 2) || 2 
          }} 
        />
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Preview</span>
      </div>
    </div>
  );
};

interface ColorPaletteProps {
  currentColor: string;
  onColorChange: (color: string) => void;
}

const PRESET_COLORS = [
  '#000000', '#7f7f7f', '#880015', '#ed1c24', '#ff7f27', '#fff200', '#22b14c', '#00a2e8', '#3f48cc', '#a349a4',
  '#ffffff', '#c3c3c3', '#b97a57', '#ffaec9', '#ffc90e', '#efe4b0', '#b5e61d', '#99d9ea', '#7092be', '#c8bfe7'
];

export const ColorPalette: React.FC<ColorPaletteProps> = ({ currentColor, onColorChange }) => {
  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-card border-t shadow-sm mt-auto">
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-md border-2 border-primary shadow-inner"
          style={{ backgroundColor: currentColor }}
        />
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">Current</span>
          <span className="text-xs font-mono uppercase">{currentColor}</span>
        </div>
      </div>

      <div className="h-8 w-px bg-border mx-2" />

      <div className="grid grid-cols-10 gap-1">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            className={`w-6 h-6 rounded-sm border transition-transform hover:scale-110 active:scale-95 ${
              currentColor === color ? 'ring-2 ring-primary ring-offset-1' : ''
            }`}
            style={{ backgroundColor: color }}
            onClick={() => onColorChange(color)}
            title={color}
          />
        ))}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Label htmlFor="custom-color" className="text-xs font-medium">Custom</Label>
        <input
          id="custom-color"
          type="color"
          value={currentColor}
          onChange={(e) => onColorChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border-none bg-transparent"
        />
      </div>
    </div>
  );
};
