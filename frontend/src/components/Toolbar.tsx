import React, { useRef } from 'react';
import { 
  Undo2,
  Redo2,
  Download,
  Upload,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Button } from './ui/button';

interface ToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  onDownload: () => void;
  onUpload: (file: File) => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onUndo,
  onRedo,
  onDownload,
  onUpload,
  canUndo,
  canRedo,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-3 bg-card border-r h-full w-16 items-center shadow-sm">
      <div className="flex flex-col gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onUndo} 
              disabled={!canUndo}
              className="h-10 w-10"
            >
              <Undo2 className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Undo</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onRedo} 
              disabled={!canRedo}
              className="h-10 w-10"
            >
              <Redo2 className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Redo</TooltipContent>
        </Tooltip>
      </div>

      <div className="flex flex-col gap-2 mt-auto">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={handleUploadClick} className="h-10 w-10">
              <Upload className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Upload Image</TooltipContent>
        </Tooltip>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onDownload} className="h-10 w-10">
              <Download className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Download Image</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};
