
import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import AdCard from './components/AdCard';
import { MOCK_IDEAS } from './constants';
import { AdIdea, ViewMode, TabCategory, Format } from './types';
import { generateAdStrategy } from './services/geminiService';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('normal');
  const [activeTab, setActiveTab] = useState<TabCategory>('Todo');
  const [activeFormat, setActiveFormat] = useState<Format>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [strategyResult, setStrategyResult] = useState<{ headlines: string[], cta: string, reasoning: string } | null>(null);

  const tabs: TabCategory[] = ['Todo', 'E-Commerce', 'SaaS B2B', 'Apps Móviles', 'Salud & Belleza', 'Finanzas'];

  const filteredIdeas = useMemo(() => {
    return MOCK_IDEAS.filter(idea => {
      const matchesTab = activeTab === 'Todo' || idea.category === activeTab;
      const matchesFormat = activeFormat === 'all' || idea.aspectRatio === activeFormat;
      const matchesSearch = idea.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          idea.prompt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesFormat && matchesSearch;
    });
  }, [activeTab, activeFormat, searchQuery]);

  const handleUseAsBase = async (idea: AdIdea) => {
    setIsGenerating(true);
    setStrategyResult(null);
    const result = await generateAdStrategy(idea.prompt);
    if (result) {
      setStrategyResult(result);
    }
    setIsGenerating(false);
  };

  return (
    <div className="flex h-screen w-full bg-background-dark font-display overflow-hidden">
      <Sidebar />
      
      <main className={`flex-1 flex flex-col h-full overflow-hidden bg-background-dark/95 relative ${viewMode === 'compact' ? 'compact-mode' : ''}`}>
        
        {/* Gemini Results Modal */}
        { (isGenerating || strategyResult) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-surface-dark border border-white/10 w-full max-w-lg rounded-2xl p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">auto_fix_high</span>
                  Gemini Creative Strategy
                </h3>
                <button onClick={() => {setStrategyResult(null); setIsGenerating(false);}} className="text-[#a69db8] hover:text-white">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {isGenerating ? (
                <div className="py-12 flex flex-col items-center justify-center gap-4">
                  <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                  <p className="text-[#a69db8] animate-pulse">Analizando visuales y generando ganchos...</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div>
                    <h4 className="text-sm font-bold text-[#a69db8] uppercase tracking-wider mb-2">Headline Variations</h4>
                    <div className="flex flex-col gap-2">
                      {strategyResult?.headlines.map((h, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 p-3 rounded-lg text-sm italic">
                          "{h}"
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#a69db8] uppercase tracking-wider mb-2">Recommended CTA</h4>
                    <div className="bg-primary/20 text-primary font-bold px-4 py-2 rounded-lg inline-block">
                      {strategyResult?.cta}
                    </div>
                  </div>
                  <div className="text-xs text-[#a69db8] bg-black/20 p-3 rounded-lg border border-white/5 leading-relaxed">
                    <strong>Reasoning:</strong> {strategyResult?.reasoning}
                  </div>
                  <button className="w-full h-11 bg-primary hover:bg-primary-dark rounded-xl font-bold transition-colors shadow-lg shadow-primary/20">
                    Aplicar Estrategia
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1400px] mx-auto w-full p-6 md:p-8 flex flex-col gap-8">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-6 items-end md:items-center justify-between">
              <div className="flex flex-col gap-1.5">
                <h2 className="text-white text-3xl font-bold tracking-tight">Explora Ideas</h2>
                <p className="text-[#a69db8] text-base font-normal">Encuentra anuncios de alto rendimiento para tu industria.</p>
              </div>
              <div className="w-full md:w-[420px]">
                <div className="relative flex w-full items-center h-12 rounded-xl bg-surface-dark border border-white/5 hover:border-white/10 focus-within:border-primary/50 transition-colors shadow-sm">
                  <div className="absolute left-3 text-[#a69db8] flex items-center justify-center">
                    <span className="material-symbols-outlined">search</span>
                  </div>
                  <input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-full bg-transparent border-none text-white placeholder:text-[#a69db8] pl-10 pr-12 focus:ring-0 text-sm" 
                    placeholder="Buscar por estilo, marca o palabra clave..." 
                    type="text"
                  />
                  <div className="absolute right-2 text-[#a69db8] flex items-center justify-center gap-1">
                    <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs text-[#a69db8] bg-white/5 rounded border border-white/10">⌘K</kbd>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs and Controls */}
            <div className="flex flex-col gap-4">
              <div className="flex gap-2 border-b border-border-dark pb-0 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative pb-3 px-2 font-medium text-sm transition-colors border-b-2 ${
                      activeTab === tab 
                        ? 'text-white border-primary' 
                        : 'text-[#a69db8] border-transparent hover:text-white hover:border-white/10'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="flex items-center gap-2 bg-surface-dark rounded-full p-1 pl-3 pr-1 border border-white/5">
                  <span className="text-xs text-[#a69db8] font-medium uppercase tracking-wider">Formato:</span>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => setActiveFormat('all')}
                      className={`size-7 rounded-full flex items-center justify-center transition-colors ${activeFormat === 'all' ? 'bg-primary text-white' : 'hover:bg-white/10 text-[#a69db8] hover:text-white'}`}
                    >
                      <span className="material-symbols-outlined text-[16px]">grid_view</span>
                    </button>
                    <button 
                      onClick={() => setActiveFormat('9:16')}
                      className={`size-7 rounded-full flex items-center justify-center transition-colors ${activeFormat === '9:16' ? 'bg-primary text-white' : 'hover:bg-white/10 text-[#a69db8] hover:text-white'}`}
                    >
                      <span className="material-symbols-outlined text-[16px]">crop_portrait</span>
                    </button>
                    <button 
                      onClick={() => setActiveFormat('1:1')}
                      className={`size-7 rounded-full flex items-center justify-center transition-colors ${activeFormat === '1:1' ? 'bg-primary text-white' : 'hover:bg-white/10 text-[#a69db8] hover:text-white'}`}
                    >
                      <span className="material-symbols-outlined text-[16px]">crop_square</span>
                    </button>
                    <button 
                      onClick={() => setActiveFormat('16:9')}
                      className={`size-7 rounded-full flex items-center justify-center transition-colors ${activeFormat === '16:9' ? 'bg-primary text-white' : 'hover:bg-white/10 text-[#a69db8] hover:text-white'}`}
                    >
                      <span className="material-symbols-outlined text-[16px]">crop_landscape</span>
                    </button>
                  </div>
                </div>

                <div className="h-6 w-px bg-white/10 mx-1" />

                <div className="flex items-center gap-2 bg-surface-dark rounded-full p-1 border border-white/5">
                  <button 
                    onClick={() => setViewMode('normal')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-xs font-medium ${viewMode === 'normal' ? 'bg-white/10 text-white' : 'text-[#a69db8] hover:text-white'}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">view_agenda</span>
                    Normal
                  </button>
                  <button 
                    onClick={() => setViewMode('compact')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-xs font-medium ${viewMode === 'compact' ? 'bg-white/10 text-white' : 'text-[#a69db8] hover:text-white'}`}
                  >
                    <span className="material-symbols-outlined text-[16px]">view_comfy</span>
                    Compacto
                  </button>
                </div>

                <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-dark border border-white/5 hover:border-primary/30 hover:bg-surface-hover transition-all group ml-auto">
                  <span className="material-symbols-outlined text-[16px] text-[#a69db8] group-hover:text-primary">tune</span>
                  <span className="text-xs font-medium text-white">Más Filtros</span>
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-dark border border-white/5 hover:border-primary/30 hover:bg-surface-hover transition-all group">
                  <span className="text-xs font-medium text-white">Recientes</span>
                  <span className="material-symbols-outlined text-[16px] text-[#a69db8]">sort</span>
                </button>
              </div>
            </div>

            {/* Grid Section */}
            <div className="masonry-grid pb-20">
              {filteredIdeas.length > 0 ? (
                filteredIdeas.map((idea) => (
                  <AdCard key={idea.id} idea={idea} onUseAsBase={handleUseAsBase} />
                ))
              ) : (
                <div className="col-span-full py-20 text-center">
                  <span className="material-symbols-outlined text-4xl text-white/20 mb-2">search_off</span>
                  <p className="text-[#a69db8]">No se encontraron resultados para tu búsqueda.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile FAB */}
        <div className="absolute bottom-8 right-8 md:hidden">
          <button className="size-14 rounded-full bg-primary text-white shadow-xl flex items-center justify-center hover:scale-105 transition-transform active:scale-95">
            <span className="material-symbols-outlined text-[28px]">add</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default App;
