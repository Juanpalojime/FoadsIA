
import React from 'react';
import { AdConfiguration, AdObjective, AspectRatio, VisualStyle } from '../types';

interface SidebarProps {
  config: AdConfiguration;
  setConfig: React.Dispatch<React.SetStateAction<AdConfiguration>>;
  onGenerate: () => void;
  onReset: () => void;
  isGenerating: boolean;
  userPrompt: string;
  setUserPrompt: (val: string) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  config, 
  setConfig, 
  onGenerate, 
  onReset,
  isGenerating,
  userPrompt,
  setUserPrompt,
  isOpen,
  toggleSidebar
}) => {
  const handleObjective = (obj: AdObjective) => setConfig(prev => ({ ...prev, objective: obj }));
  const handleStyle = (style: VisualStyle) => setConfig(prev => ({ ...prev, visualStyle: style }));
  const handleMood = (mood: 'bright' | 'dark_mode' | 'neon') => setConfig(prev => ({ ...prev, mood }));
  const handleRatio = (ratio: AspectRatio) => setConfig(prev => ({ ...prev, aspectRatio: ratio }));

  const updateAdvanced = (key: keyof AdConfiguration['advanced'], val: number) => {
    setConfig(prev => ({
      ...prev,
      advanced: { ...prev.advanced, [key]: val }
    }));
  };

  return (
    <aside className={`${isOpen ? 'w-[380px]' : 'w-0'} shrink-0 flex flex-col border-r border-border-dark bg-surface-dark h-full z-20 transition-all duration-300 shadow-[4px_0_24px_rgba(0,0,0,0.3)] relative`}>
      <div className="absolute -right-[28px] top-1/2 -translate-y-1/2 z-30">
        <button 
          onClick={toggleSidebar}
          className="flex h-20 w-7 items-center justify-center rounded-r-xl border-y border-r border-border-dark bg-surface-dark text-text-secondary shadow-[4px_0_12px_rgba(0,0,0,0.5)] hover:bg-[#2e2938] hover:text-white hover:w-8 transition-all duration-200 focus:outline-none"
        >
          <span className="material-symbols-outlined text-[20px]">{isOpen ? 'chevron_left' : 'chevron_right'}</span>
        </button>
      </div>

      <div className={`flex-1 flex flex-col h-full ${!isOpen && 'hidden'}`}>
        <div className="flex items-center justify-between px-6 py-6 border-b border-border-dark bg-surface-dark/95 backdrop-blur-sm sticky top-0 z-10">
          <div>
            <h2 className="text-white text-xl font-bold leading-tight tracking-tight">Crear Anuncio</h2>
            <p className="text-text-secondary text-xs mt-1.5 flex items-center gap-1.5">
              <span className={`size-2 rounded-full ${isGenerating ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`}></span>
              {isGenerating ? 'Generando...' : 'Panel de configuración'}
            </p>
          </div>
          <button onClick={onReset} className="text-text-secondary hover:text-white hover:bg-white/5 px-2 py-1 rounded transition-colors text-xs font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            Reset
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Prompt Input */}
          <div className="flex flex-col gap-4">
            <label className="text-sm font-bold text-text-highlight uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">description</span>
              Descripción del Anuncio
            </label>
            <textarea 
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Ej: Zapatillas de running premium sobre fondo futurista..."
              className="w-full h-24 rounded-xl border border-border-dark bg-[#1f1c26] p-4 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors resize-none"
            />
          </div>

          <div className="h-px bg-border-dark w-full"></div>

          {/* Objective Selection */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-text-highlight uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">target</span>
                Objetivo
              </label>
            </div>
            <div className="grid gap-3">
              {[
                { id: 'direct_sales', icon: 'shopping_cart', title: 'Direct Sales', desc: 'Optimizado para conversión y CTA claro.' },
                { id: 'brand_awareness', icon: 'visibility', title: 'Brand Awareness', desc: 'Foco en logotipo y mensaje visual.' },
                { id: 'traffic', icon: 'ads_click', title: 'Traffic', desc: 'Diseño que incita al clic.' }
              ].map((obj) => (
                <button 
                  key={obj.id}
                  onClick={() => handleObjective(obj.id as AdObjective)}
                  className={`relative flex items-center gap-4 p-4 rounded-xl transition-all border-2 ${
                    config.objective === obj.id 
                    ? 'bg-gradient-to-r from-primary/20 to-primary/5 border-primary shadow-glow ring-1 ring-primary/50' 
                    : 'bg-[#1f1c26] border-border-dark hover:border-text-secondary/30 hover:bg-[#25222e]'
                  }`}
                >
                  <div className={`flex items-center justify-center size-12 rounded-full shadow-md transition-all ${
                    config.objective === obj.id ? 'bg-primary text-white' : 'bg-[#2e2938] text-text-secondary'
                  }`}>
                    <span className="material-symbols-outlined text-[24px]">{obj.icon}</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`text-base font-bold transition-colors ${config.objective === obj.id ? 'text-white' : 'text-text-secondary'}`}>{obj.title}</p>
                    <p className={`text-xs mt-0.5 ${config.objective === obj.id ? 'text-white/80' : 'text-text-secondary/60'}`}>{obj.desc}</p>
                  </div>
                  {config.objective === obj.id && (
                    <div className="absolute top-3 right-3">
                      <span className="material-symbols-outlined text-[20px] text-primary fill">check_circle</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-border-dark w-full"></div>

          {/* Visual Style Selection */}
          <div className="flex flex-col gap-4">
            <label className="text-sm font-bold text-text-highlight uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">palette</span>
              Estilo Visual
            </label>
            <div className="space-y-3">
              <div className="relative group">
                <select 
                  value={config.visualStyle}
                  onChange={(e) => handleStyle(e.target.value as VisualStyle)}
                  className="w-full appearance-none rounded-xl border border-border-dark bg-[#1f1c26] p-4 pr-10 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary h-14 font-medium transition-colors cursor-pointer"
                >
                  <option value="ecommerce_clean">Ecommerce Clean</option>
                  <option value="lifestyle_outdoor">Lifestyle Outdoor</option>
                  <option value="cyber_marketing">Cyber Marketing</option>
                  <option value="minimalist_studio">Minimalist Studio</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-text-secondary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">expand_more</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {[
                  { id: 'bright', label: 'Bright', icon: 'wb_sunny' },
                  { id: 'dark_mode', label: 'Dark Mode', icon: 'dark_mode' },
                  { id: 'neon', label: 'Neon', icon: 'flare' }
                ].map(m => (
                  <button 
                    key={m.id}
                    onClick={() => handleMood(m.id as any)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                      config.mood === m.id 
                      ? 'bg-primary text-white border border-primary shadow-glow-sm ring-2 ring-primary/20' 
                      : 'bg-[#2e2938] border border-transparent text-text-secondary hover:text-white hover:bg-[#3e3849]'
                    }`}
                  >
                    {config.mood === m.id && <span className="material-symbols-outlined text-[14px]">check</span>}
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="h-px bg-border-dark w-full"></div>

          {/* Dimensions Selection */}
          <div className="flex flex-col gap-4">
            <label className="text-sm font-bold text-text-highlight uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">aspect_ratio</span>
              Dimensiones
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: '1:1', res: '1080x1080', icon: 'square' },
                { id: '9:16', res: '1080x1920', icon: 'smartphone' },
                { id: '16:9', res: '1920x1080', icon: 'desktop_windows' }
              ].map(r => (
                <label key={r.id} className="relative cursor-pointer group">
                  <input 
                    type="radio" 
                    name="ratio" 
                    checked={config.aspectRatio === r.id}
                    onChange={() => handleRatio(r.id as AspectRatio)}
                    className="peer sr-only" 
                  />
                  <div className="flex flex-col items-center justify-center rounded-xl border-2 border-border-dark bg-[#1f1c26] p-3 transition-all duration-200 hover:bg-[#25222e] hover:border-[#443c53] peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:shadow-glow-sm h-28">
                    <span className="material-symbols-outlined text-[24px] text-text-secondary peer-checked:text-white mb-2">{r.icon}</span>
                    <span className="text-xs font-bold text-text-secondary peer-checked:text-white mb-0.5">{r.id}</span>
                    <span className="text-[10px] text-text-secondary/60">{r.res}</span>
                  </div>
                  {config.aspectRatio === r.id && (
                    <div className="absolute -top-2 -right-2 flex size-5 bg-surface-dark rounded-full items-center justify-center shadow-lg ring-2 ring-primary/20">
                      <span className="material-symbols-outlined text-[20px] text-primary fill">check_circle</span>
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          <div className="h-px bg-border-dark w-full"></div>

          {/* Advanced Section */}
          <details className="group rounded-xl border border-border-dark bg-[#131118] overflow-hidden transition-all hover:border-[#443c53]" open>
            <summary className="flex cursor-pointer items-center justify-between px-5 py-4 hover:bg-[#1f1c26] transition-colors select-none bg-[#1f1c26]/50">
              <span className="text-sm font-bold text-text-highlight uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">tune</span>
                Avanzado
              </span>
              <span className="material-symbols-outlined text-text-secondary transition-transform duration-300 group-open:rotate-180">expand_more</span>
            </summary>
            <div className="px-5 pb-6 pt-4 flex flex-col gap-8 bg-surface-dark border-t border-border-dark/50">
              {/* Creativity Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-white mb-1">Creatividad</span>
                    <span className="text-[10px] text-text-secondary">Nivel de libertad de la IA</span>
                  </div>
                  <span className="text-primary font-mono bg-primary/10 border border-primary/20 px-2 py-0.5 rounded text-xs font-bold">{config.advanced.creativity}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={config.advanced.creativity}
                  onChange={(e) => updateAdvanced('creativity', parseInt(e.target.value))}
                  className="w-full h-1.5 bg-[#2e2938] rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-2 focus:ring-primary/30" 
                />
              </div>

              {/* Variations Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-white mb-1">Variaciones</span>
                    <span className="text-[10px] text-text-secondary">Imágenes por generación</span>
                  </div>
                  <span className="text-primary font-mono bg-primary/10 border border-primary/20 px-2 py-0.5 rounded text-xs font-bold">{config.advanced.variations}</span>
                </div>
                <input 
                  type="range" 
                  min="1" max="4" 
                  value={config.advanced.variations}
                  onChange={(e) => updateAdvanced('variations', parseInt(e.target.value))}
                  className="w-full h-1.5 bg-[#2e2938] rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-2 focus:ring-primary/30" 
                />
              </div>

              {/* Guidance Scale Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-white mb-1">Guidance Scale</span>
                    <span className="text-[10px] text-text-secondary">Fidelidad al prompt</span>
                  </div>
                  <span className="text-primary font-mono bg-primary/10 border border-primary/20 px-2 py-0.5 rounded text-xs font-bold">{config.advanced.guidanceScale}</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="20" step="0.1" 
                  value={config.advanced.guidanceScale}
                  onChange={(e) => updateAdvanced('guidanceScale', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#2e2938] rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-2 focus:ring-primary/30" 
                />
              </div>
            </div>
          </details>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-border-dark bg-surface-dark mt-auto z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
          <button 
            onClick={onGenerate}
            disabled={isGenerating}
            className={`group w-full flex items-center justify-center gap-3 rounded-xl px-4 py-4 text-sm font-bold text-white transition-all shadow-glow hover:translate-y-[-1px] hover:shadow-glow-lg ${
              isGenerating ? 'bg-primary/50 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover focus:outline-none focus:ring-4 focus:ring-primary/30'
            }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${isGenerating ? 'animate-spin' : 'animate-pulse'}`}>
              {isGenerating ? 'refresh' : 'auto_awesome'}
            </span>
            {isGenerating ? 'Generando Anuncio...' : 'Generar Anuncio'}
          </button>
          <div className="flex justify-center items-center gap-2 mt-3 text-[11px] text-text-secondary">
            <span className="material-symbols-outlined text-[14px]">token</span>
            Cost: 2 credits
          </div>
        </div>
      </div>
    </aside>
  );
};
