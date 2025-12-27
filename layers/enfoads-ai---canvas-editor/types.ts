
export interface Layer {
  id: string;
  name: string;
  type: 'image' | 'text' | 'background' | 'ai';
  visible: boolean;
  locked: boolean;
  content: string; // URL or base64 or text string
  isProcessing?: boolean;
}

export type ToolType = 'select' | 'pencil' | 'brush' | 'shapes' | 'text' | 'crop' | 'eraser';

export interface Selection {
  top: number;
  left: number;
  width: number;
  height: number;
}
