
import React, { useState } from 'react';
import { Selection, Layer } from '../types';

interface CanvasAreaProps {
  zoom: number;
  layers: Layer[];
  onGenerate: (selection: Selection) => void;
  isGenerating: boolean;
}

const CanvasArea: React.FC<CanvasAreaProps> = ({ zoom, layers, onGenerate, isGenerating }) => {
  const [selection, setSelection] = useState<Selection>({
    top: 10,
    left: 70,
    width: 180,
    height: 180
  });

  return (
    <div className="flex-1 canvas-grid relative overflow-hidden cursor-grab flex items-center justify-center h-full w-full">
      {/* Canvas Content Wrapper */}
      <div 
        className="relative group/canvas-content transform transition-transform duration-200 ease-out"
        style={{ transform: `scale(${zoom / 100})` }}
      >
        {/* Main Ad Composition Frame */}
        <div className="w-[600px] h-[600px] bg-white relative shadow-2xl overflow-hidden select-none">
          {/* Render Layers */}
          {layers.map((layer) => {
            if (!layer.visible) return null;

            if (layer.type === 'background') {
              return (
                <div 
                  key={layer.id}
                  className="absolute inset-0 bg-neutral-100" 
                  style={{ background: layer.content }}
                />
              );
            }

            if (layer.type === 'image' || layer.type === 'ai') {
              return (
                <div 
                  key={layer.id}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] z-10"
                >
                  <img 
                    className={`w-full drop-shadow-2xl object-contain transition-opacity duration-300 ${layer.isProcessing ? 'opacity-40 animate-pulse' : 'opacity-100'}`} 
                    src={layer.content} 
                    alt={layer.name}
                  />
                </div>
              );
            }

            return null;
          })}

          {/* "Generative Area" Selection Box */}
          <div 
            className="absolute border-2 border-dashed border-primary bg-primary/5 rounded-lg flex items-center justify-center z-20 ring-4 ring-primary/10 animate-pulse"
            style={{
              top: `${selection.top}%`,
              left: `${selection.left}%`,
              width: `${selection.width}px`,
              height: `${selection.height}px`
            }}
          >
            {/* Floating Action Button attached to selection */}
            <button 
              onClick={() => onGenerate(selection)}
              disabled={isGenerating}
              className={`absolute -bottom-5 left-1/2 -translate-x-1/2 bg-primary hover:bg-[#5b26c4] text-white text-xs font-bold py-1.5 px-4 rounded-full shadow-lg flex items-center gap-1.5 whitespace-nowrap transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                {isGenerating ? 'refresh' : 'auto_awesome'}
              </span>
              {isGenerating ? 'Generating...' : '+ Área Gen'}
            </button>
          </div>
        </div>

        {/* Canvas Size Indicator */}
        <div className="absolute -top-8 left-0 text-xs text-white/40 font-mono">1080 x 1080 px</div>
      </div>
    </div>
  );
};

export default CanvasArea;
