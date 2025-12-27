
import React from 'react';
import { ToolType } from '../types';

interface ToolbarProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ activeTool, setActiveTool }) => {
  const tools: { id: ToolType; icon: string; title: string; divider?: boolean }[] = [
    { id: 'select', icon: 'arrow_selector_tool', title: 'Select' },
    { id: 'pencil', icon: 'edit', title: 'Pencil', divider: true },
    { id: 'brush', icon: 'brush', title: 'Brush' },
    { id: 'shapes', icon: 'check_box_outline_blank', title: 'Shapes' },
    { id: 'text', icon: 'title', title: 'Text', divider: true },
    { id: 'crop', icon: 'crop', title: 'Crop' },
    { id: 'eraser', icon: 'ink_eraser', title: 'Eraser' },
  ];

  return (
    <div className="absolute left-6 top-6 z-20 flex flex-col bg-surface-dark border border-border-dark rounded-xl shadow-xl backdrop-blur-sm bg-opacity-90 p-1.5 gap-2">
      {tools.map((tool) => (
        <React.Fragment key={tool.id}>
          {tool.divider && <div className="h-px w-full bg-white/10 my-0.5"></div>}
          <button 
            onClick={() => setActiveTool(tool.id)}
            className={`p-2.5 rounded-lg transition-colors group relative ${activeTool === tool.id ? 'text-white bg-primary shadow-sm' : 'text-muted-text hover:text-white hover:bg-white/10'}`} 
            title={tool.title}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{tool.icon}</span>
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};

export default Toolbar;
