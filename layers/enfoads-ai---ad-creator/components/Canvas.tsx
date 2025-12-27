
import React, { useState } from 'react';
import { AdConfiguration } from '../types';

interface CanvasProps {
  config: AdConfiguration;
  isGenerating: boolean;
  generatedImage: string | null;
  generatedCopy: string | null;
}

export const Canvas: React.FC<CanvasProps> = ({ config, isGenerating, generatedImage, generatedCopy }) => {
  const [zoom, setZoom] = useState(100);

  // Determine preview box size based on ratio
  const getPreviewSize = () => {
    switch(config.aspectRatio) {
      case '9:16': return 'w-[281px] h-[500px]';
      case '16:9': return 'w-[500px] h-[281px]';
      default: return 'w-[500px] h-[500px]';
    }
  };

  return (
    <>
      {/* Toolbar */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[#1f1c26]/90 backdrop-blur-md rounded-full border border-border-dark px-2 py-1.5 z-10 shadow-lg">
        <button className="p-2 rounded-full text-text-secondary hover:text-white hover:bg-white/10 transition-colors" title="Select">
          <span className="material-symbols-outlined text-[20px]">pan_tool_alt</span>
        </button>
        <div className="w-px h-4 bg-border-dark mx-1"></div>
        <button className="p-2 rounded-full text-white bg-primary/20 text-primary" title="Hand tool">
          <span className="material-symbols-outlined text-[20px] fill">pan_tool</span>
        </button>
        <div className="w-px h-4 bg-border-dark mx-1"></div>
        <button 
          onClick={() => setZoom(Math.max(10, zoom - 10))}
          className="p-2 rounded-full text-text-secondary hover:text-white hover:bg-white/10 transition-colors" title="Zoom Out">
          <span className="material-symbols-outlined text-[20px]">remove</span>
        </button>
        <span className="text-xs font-mono text-white min-w-[3rem] text-center font-medium">{zoom}%</span>
        <button 
          onClick={() => setZoom(Math.min(200, zoom + 10))}
          className="p-2 rounded-full text-text-secondary hover:text-white hover:bg-white/10 transition-colors" title="Zoom In">
          <span className="material-symbols-outlined text-[20px]">add</span>
        </button>
      </div>

      {/* Grid Background */}
      <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#443c53 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

      {/* Main Preview */}
      <div className="flex-1 flex items-center justify-center p-10 z-0 overflow-auto">
        <div 
          style={{ transform: `scale(${zoom / 100})` }}
          className="flex flex-col items-center gap-6 transition-all duration-300"
        >
          <div className={`${getPreviewSize()} rounded-xl border-2 border-dashed border-primary bg-[#161121]/80 flex items-center justify-center group overflow-hidden shadow-glow-lg transition-all duration-500 relative`}>
            
            {/* Overlay Badges */}
            <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1.5 rounded-md text-[11px] font-bold shadow-lg flex items-center gap-1.5 z-20">
              <span className="material-symbols-outlined text-[14px]">aspect_ratio</span>
              {config.aspectRatio} PREVIEW
            </div>

            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-100"></div>

            {/* Generated Content or Placeholder */}
            {isGenerating ? (
              <div className="text-center p-8 relative z-10 animate-pulse">
                <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-[#1f1c26] text-primary shadow-inner border border-primary/30">
                  <span className="material-symbols-outlined text-[48px] animate-spin">sync</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Creando...</h3>
                <p className="text-sm text-text-secondary max-w-[280px]">Estamos orquestando los pixeles perfectos para tu campaña.</p>
              </div>
            ) : generatedImage ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img 
                  src={generatedImage} 
                  alt="Generated Ad" 
                  className="w-full h-full object-cover"
                />
                {generatedCopy && (
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white font-bold text-xl drop-shadow-lg leading-tight">
                      {generatedCopy.split('\n')[0]}
                    </p>
                    <p className="text-white/80 text-sm mt-1 line-clamp-2">
                      {generatedCopy.split('\n').slice(1).join(' ')}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-8 relative z-10 group">
                <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-[#1f1c26] text-text-secondary shadow-inner border border-border-dark group-hover:border-primary/50 group-hover:text-primary transition-all duration-300">
                  <span className="material-symbols-outlined text-[48px]">image</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Vista Previa</h3>
                <p className="text-sm text-text-secondary max-w-[280px] leading-relaxed">Configura los parámetros en el panel <strong className="text-primary">Crear Anuncio</strong> para generar tu primera variante.</p>
                <div className="mt-8 flex justify-center gap-3">
                  <span className="text-[11px] font-medium bg-primary/10 px-3 py-1.5 rounded-full text-primary border border-primary/20 shadow-glow-sm capitalize">
                    {config.objective.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] font-medium bg-primary/10 px-3 py-1.5 rounded-full text-primary border border-primary/20 shadow-glow-sm capitalize">
                    {config.mood.replace('_', ' ')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="h-9 border-t border-border-dark bg-surface-dark flex items-center justify-between px-6 text-[11px] text-text-secondary z-10">
        <div className="flex gap-6">
          <span className="flex items-center gap-1.5 text-green-400">
            <span className={`size-1.5 rounded-full ${isGenerating ? 'bg-orange-400 animate-pulse' : 'bg-green-400'}`}></span>
            {isGenerating ? 'Generating...' : 'Ready to generate'}
          </span>
          <span className="text-text-secondary/50">|</span>
          <span>Model: <span className="text-white">EnfoUltra V4.2</span></span>
        </div>
        <div className="flex gap-6 font-mono">
          <span>X: 0</span>
          <span>Y: 0</span>
        </div>
      </div>
    </>
  );
};
