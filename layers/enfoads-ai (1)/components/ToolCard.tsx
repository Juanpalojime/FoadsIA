
import React from 'react';
import { Tool } from '../types';

interface ToolCardProps {
  tool: Tool;
  onClick: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer flex flex-col gap-4 rounded-xl border border-border-dark bg-surface-dark p-6 hover:border-primary hover:shadow-[0_0_20px_rgba(110,48,232,0.1)] transition-all duration-300 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="material-symbols-outlined text-primary -rotate-45">arrow_forward</span>
      </div>
      
      <div className={`size-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${tool.color}`}>
        <span className="material-symbols-outlined text-[28px]">{tool.icon}</span>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        <h3 className="text-white text-xl font-bold">{tool.name}</h3>
        <p className="text-muted-text text-sm leading-relaxed">{tool.description}</p>
      </div>

      <div className="mt-auto">
        <button className="text-sm font-bold text-white group-hover:text-primary flex items-center gap-1 transition-colors">
          Usar herramienta <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

export default ToolCard;
