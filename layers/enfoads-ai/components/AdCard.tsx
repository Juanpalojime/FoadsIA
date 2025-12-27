
import React from 'react';
import { AdIdea } from '../types';

interface AdCardProps {
  idea: AdIdea;
  onUseAsBase: (idea: AdIdea) => void;
}

const AdCard: React.FC<AdCardProps> = ({ idea, onUseAsBase }) => {
  const aspectClass = {
    '9:16': 'aspect-[9/16]',
    '1:1': 'aspect-square',
    '16:9': 'aspect-video',
    '4:5': 'aspect-[4/5]'
  }[idea.aspectRatio];

  return (
    <div className="masonry-item relative group rounded-2xl overflow-hidden bg-surface-dark border border-white/5 shadow-lg hover:shadow-primary/5 transition-all duration-300">
      <div 
        className={`${aspectClass} w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105`}
        style={{ backgroundImage: `url('${idea.imageUrl}')` }}
      />
      
      <div className="absolute top-3 left-3 z-10 flex gap-2">
        {idea.ctr && (
          <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-green-400 border border-green-500/20 flex items-center gap-1 shadow-sm">
            <span className="material-symbols-outlined text-[12px]">trending_up</span> CTR {idea.ctr}
          </div>
        )}
        {idea.conv && (
          <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-green-400 border border-green-500/20 flex items-center gap-1 shadow-sm">
            <span className="material-symbols-outlined text-[12px]">trending_up</span> Conv. {idea.conv}
          </div>
        )}
        {!idea.ctr && !idea.conv && idea.category && (
           <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-white border border-white/20 shadow-sm flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">label</span> {idea.category}
          </div>
        )}
      </div>

      <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button className="size-9 rounded-full bg-surface-dark/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-all shadow-lg border border-white/10" title="Añadir a favoritos">
          <span className="material-symbols-outlined text-[20px]">favorite</span>
        </button>
      </div>

      <div className="card-overlay absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
        <div className="flex flex-col gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          <button 
            onClick={() => onUseAsBase(idea)}
            className="w-full h-10 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">auto_fix_high</span> Usar como Base
          </button>
          
          <div className="grid grid-cols-3 gap-2">
            <button className="col-span-1 h-9 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-[10px] font-medium rounded-lg flex items-center justify-center gap-1 transition-colors border border-white/10">
              <span className="material-symbols-outlined text-[14px]">content_copy</span> Prompt
            </button>
            <button className="col-span-1 h-9 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-[10px] font-medium rounded-lg flex items-center justify-center gap-1 transition-colors border border-white/10">
              <span className="material-symbols-outlined text-[14px]">folder_open</span> Campaña
            </button>
            <button className="col-span-1 h-9 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-[10px] font-medium rounded-lg flex items-center justify-center gap-1 transition-colors border border-white/10">
              <span className="material-symbols-outlined text-[14px]">analytics</span> Métricas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdCard;
