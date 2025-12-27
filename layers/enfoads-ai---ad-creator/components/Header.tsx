
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-border-dark bg-surface-dark px-6 py-3 z-30 relative shadow-md">
      <div className="flex items-center gap-4 text-white">
        <div className="size-8 flex items-center justify-center bg-primary/20 rounded-lg text-primary shadow-glow-sm">
          <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
        </div>
        <h1 className="text-white text-lg font-bold tracking-tight">ENFOADS AI <span className="text-text-secondary font-normal text-sm ml-2">/ Crear Anuncio</span></h1>
      </div>
      <div className="flex items-center gap-6">
        <button className="text-text-secondary hover:text-white transition-colors flex items-center gap-2 text-sm bg-surface-dark/50 px-3 py-1.5 rounded-full border border-border-dark hover:border-text-secondary/50">
          <span className="material-symbols-outlined text-[18px]">help</span>
          <span className="hidden lg:inline">Help Center</span>
        </button>
        <button className="text-text-secondary hover:text-white transition-colors relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-0 right-0 size-2 bg-red-500 rounded-full border-2 border-surface-dark"></span>
        </button>
        <div 
          className="bg-center bg-no-repeat bg-cover rounded-full size-9 border border-border-dark ring-2 ring-transparent hover:ring-primary/50 transition-all cursor-pointer"
          style={{ backgroundImage: 'url("https://picsum.photos/seed/user/100/100")' }}
        ></div>
      </div>
    </header>
  );
};
