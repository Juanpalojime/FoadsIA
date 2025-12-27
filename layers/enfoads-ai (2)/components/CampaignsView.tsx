
import React from 'react';
import { CAMPAIGNS, GENERATIONS } from '../constants';

const CampaignsView: React.FC = () => {
  return (
    <div className="flex-1 h-full overflow-y-auto relative flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background-dark/95 backdrop-blur-md border-b border-border-muted">
        <div className="w-full max-w-[1400px] mx-auto p-6 md:p-8 flex flex-col gap-6">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Mis Campañas</h2>
            <button className="flex items-center justify-center gap-2 h-11 px-6 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span>New Campaign</span>
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="relative w-full lg:max-w-md group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-text-muted group-focus-within:text-primary transition-colors">search</span>
              </div>
              <input
                className="block w-full pl-10 pr-3 py-2.5 bg-surface-dark border border-border-muted rounded-xl leading-5 placeholder-text-muted text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-all"
                placeholder="Buscar campaña por nombre o cliente..."
                type="text"
              />
            </div>
            
            <div className="flex gap-3 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto no-scrollbar">
              <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-xl bg-surface-dark border border-border-muted pl-4 pr-3 hover:border-primary/50 transition-colors">
                <p className="text-white text-sm font-medium">Cliente: <span className="text-primary font-bold">Todos</span></p>
                <span className="material-symbols-outlined text-text-muted text-[20px]">expand_more</span>
              </button>
              <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-xl bg-surface-dark border border-border-muted pl-4 pr-3 hover:border-primary/50 transition-colors">
                <p className="text-white text-sm font-medium">Fecha: <span className="text-primary font-bold">Últimos 30 días</span></p>
                <span className="material-symbols-outlined text-text-muted text-[20px]">expand_more</span>
              </button>
            </div>
          </div>

          <div className="flex border-b border-border-muted gap-8 mt-2">
            <button className="flex items-center justify-center border-b-2 border-primary text-white pb-3 pt-2 px-1 cursor-pointer transition-colors">
              <p className="text-primary text-sm font-bold tracking-wide">Todo</p>
            </button>
            <button className="flex items-center justify-center border-b-2 border-transparent text-text-muted hover:text-white pb-3 pt-2 px-1 cursor-pointer transition-colors">
              <p className="text-sm font-medium tracking-wide">Imágenes</p>
            </button>
            <button className="flex items-center justify-center border-b-2 border-transparent text-text-muted hover:text-white pb-3 pt-2 px-1 cursor-pointer transition-colors">
              <p className="text-sm font-medium tracking-wide">Videos</p>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="w-full max-w-[1400px] mx-auto p-6 md:p-8 flex flex-col gap-10 pb-20">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Carpetas Activas</h3>
            <button className="text-sm font-bold text-primary hover:text-white transition-colors">Ver todas</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CAMPAIGNS.map((campaign) => (
              <div key={campaign.id} className="group relative bg-surface-dark hover:bg-surface-hover border border-border-muted hover:border-primary/50 rounded-2xl p-5 transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <div className={`h-12 w-12 rounded-xl ${campaign.id === '1' ? 'bg-primary/10 text-primary' : 'bg-white/5 text-white'} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <span className="material-symbols-outlined text-[28px] fill-1">folder</span>
                  </div>
                  <button className="text-text-muted hover:text-white">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </div>
                <h4 className="text-white font-bold text-lg mb-1 group-hover:text-primary transition-colors">{campaign.name}</h4>
                <p className="text-text-muted text-sm">{campaign.assetsCount} assets generated</p>
                <div className="mt-4 flex -space-x-2 overflow-hidden">
                  {campaign.thumbnails.map((thumb, idx) => (
                    <img key={idx} className="inline-block h-6 w-6 rounded-full ring-2 ring-surface-dark" src={thumb} alt="Campaign Asset" />
                  ))}
                  {campaign.assetsCount > campaign.thumbnails.length && (
                    <div className="h-6 w-6 rounded-full ring-2 ring-surface-dark bg-border-muted flex items-center justify-center text-[8px] text-white font-bold">
                      +{campaign.assetsCount - campaign.thumbnails.length}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div className="group relative bg-surface-dark/50 border-2 border-dashed border-border-muted hover:border-primary/50 hover:bg-surface-dark rounded-2xl p-5 transition-all cursor-pointer flex flex-col items-center justify-center text-center h-full min-h-[160px]">
              <div className="h-12 w-12 rounded-full bg-border-muted group-hover:bg-primary/20 flex items-center justify-center text-text-muted group-hover:text-primary mb-3 transition-colors">
                <span className="material-symbols-outlined text-[24px]">add</span>
              </div>
              <h4 className="text-white font-bold text-base">Crear Carpeta</h4>
              <p className="text-text-muted text-xs mt-1">Organize your next campaign</p>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary">history</span>
            <h3 className="text-xl font-bold text-white">Generaciones Recientes</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {GENERATIONS.map((gen) => (
              <div key={gen.id} className="group relative aspect-[4/5] bg-surface-dark rounded-xl overflow-hidden border border-border-muted hover:border-primary transition-all">
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="h-8 w-8 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center hover:bg-primary">
                    <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                  </button>
                </div>
                <div className="absolute top-2 left-2 z-10">
                  <span className={`px-2 py-1 rounded ${gen.status === 'Ready' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'} text-[10px] font-bold uppercase tracking-wider border backdrop-blur-sm`}>
                    {gen.status}
                  </span>
                </div>
                {gen.imageUrl ? (
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={gen.imageUrl} alt={gen.title} />
                ) : (
                  <div className="w-full h-full bg-surface-hover flex flex-col items-center justify-center animate-pulse">
                    <span className="material-symbols-outlined text-text-muted text-4xl mb-2 animate-spin">sync</span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                  <p className="text-white text-sm font-bold truncate">{gen.title}</p>
                  <p className="text-xs text-text-muted">{gen.timeAgo}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CampaignsView;
