
import React from 'react';

interface BottomBarProps {
  zoom: number;
  setZoom: (zoom: number) => void;
}

const BottomBar: React.FC<BottomBarProps> = ({ zoom, setZoom }) => {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-surface-dark border border-border-dark p-2 pl-4 pr-2 rounded-full shadow-xl backdrop-blur-md z-30">
      {/* Undo/Redo */}
      <div className="flex items-center gap-1 border-r border-white/10 pr-3 mr-1">
        <button className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>undo</span>
        </button>
        <button className="p-1.5 text-white/30 cursor-not-allowed rounded-full">
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>redo</span>
        </button>
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center gap-3 min-w-[180px]">
        <button 
          onClick={() => setZoom(Math.max(10, zoom - 10))}
          className="text-white/70 hover:text-white"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>remove</span>
        </button>
        
        <div className="flex-1 h-1 bg-white/10 rounded-full relative group cursor-pointer">
          <input 
            type="range"
            min="10"
            max="200"
            value={zoom}
            onChange={(e) => setZoom(parseInt(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div 
            className="absolute left-0 top-0 h-full bg-white rounded-full"
            style={{ width: `${(zoom - 10) / 190 * 100}%` }}
          ></div>
          <div 
            className="absolute top-1/2 -translate-y-1/2 size-3 bg-white rounded-full shadow border border-surface-dark group-hover:scale-125 transition-transform"
            style={{ left: `${(zoom - 10) / 190 * 100}%` }}
          ></div>
        </div>

        <button 
          onClick={() => setZoom(Math.min(200, zoom + 10))}
          className="text-white/70 hover:text-white"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
        </button>
        <span className="text-xs font-mono w-9 text-right text-white/90">{zoom}%</span>
      </div>

      {/* Play Button */}
      <button className="bg-primary hover:bg-primary/90 text-white p-2 rounded-full ml-2 shadow-lg transition-transform active:scale-95">
        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>play_arrow</span>
      </button>
    </div>
  );
};

export default BottomBar;
