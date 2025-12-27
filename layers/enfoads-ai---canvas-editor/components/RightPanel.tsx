
import React, { useState } from 'react';
import { Layer } from '../types';

interface RightPanelProps {
  layers: Layer[];
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onAddLayer: () => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ layers, onToggleVisibility, onToggleLock, onAddLayer }) => {
  const [activeTab, setActiveTab] = useState<'layers' | 'properties'>('layers');

  return (
    <aside className="w-72 bg-[#131118] border-l border-border-dark flex flex-col z-20 h-full">
      {/* Tabs */}
      <div className="flex border-b border-border-dark shrink-0">
        <button 
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'layers' ? 'text-white border-b-2 border-primary bg-white/5' : 'text-muted-text hover:text-white hover:bg-white/5'}`}
        >
          Layers
        </button>
        <button 
          onClick={() => setActiveTab('properties')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'properties' ? 'text-white border-b-2 border-primary bg-white/5' : 'text-muted-text hover:text-white hover:bg-white/5'}`}
        >
          Properties
        </button>
      </div>

      {/* Layers List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-2">
        {activeTab === 'layers' ? (
          layers.map((layer) => (
            <div 
              key={layer.id}
              className={`group flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all border ${layer.isProcessing ? 'bg-primary/5 border-primary/20' : 'hover:bg-white/5 border-transparent hover:border-white/10'}`}
            >
              <button 
                onClick={(e) => { e.stopPropagation(); onToggleVisibility(layer.id); }}
                className={`${layer.visible ? 'text-white/70 hover:text-white' : 'text-white/20 hover:text-white/40'}`}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  {layer.visible ? 'visibility' : 'visibility_off'}
                </span>
              </button>
              
              <div className={`size-8 rounded overflow-hidden shrink-0 border border-white/10 flex items-center justify-center ${layer.type === 'ai' ? 'bg-gradient-to-br from-primary/40 to-purple-900/40' : 'bg-white/5'}`}>
                {layer.type === 'text' ? (
                  <span className="text-white font-serif font-bold text-xs">T</span>
                ) : layer.type === 'image' || layer.type === 'ai' ? (
                  layer.content.startsWith('data') || layer.content.startsWith('http') ? (
                    <img className="w-full h-full object-cover" src={layer.content} alt="thumbnail" />
                  ) : (
                    <span className="material-symbols-outlined text-white/50" style={{ fontSize: '16px' }}>auto_awesome</span>
                  )
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400"></div>
                )}
              </div>

              <div className="flex flex-col flex-1 min-w-0">
                <span className={`text-sm font-medium truncate ${layer.isProcessing ? 'text-white/90' : 'text-white'}`}>
                  {layer.name}
                </span>
                {layer.isProcessing && (
                  <span className="text-[10px] text-primary">Processing...</span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {layer.isProcessing && (
                   <span className="relative flex h-2 w-2 mr-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); onToggleLock(layer.id); }}
                  className="text-white/40 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    {layer.locked ? 'lock' : 'lock_open'}
                  </span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-muted-text text-sm italic">
            Select a layer to view properties.
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-border-dark bg-[#131118]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-muted-text uppercase tracking-wider">Blending</span>
          <span className="text-xs text-white">Normal</span>
        </div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-muted-text uppercase tracking-wider">Opacity</span>
          <span className="text-xs text-white">100%</span>
        </div>
        <button 
          onClick={onAddLayer}
          className="w-full flex items-center justify-center gap-2 bg-[#2e2938] hover:bg-[#3d364a] text-white py-2.5 rounded-lg transition-colors font-medium text-sm"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add_box</span>
          New Layer
        </button>
      </div>
    </aside>
  );
};

export default RightPanel;
