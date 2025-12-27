
import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import ToolCard from './components/ToolCard';
import ToolModal from './components/ToolModal';
import { Tool, ToolCategory } from './types';

const TOOLS: Tool[] = [
  {
    id: 'upscaler',
    name: 'Upscaler',
    description: 'Mejora la resolución de tus imágenes hasta 4x sin perder calidad visual.',
    icon: 'fit_screen',
    color: 'bg-primary/10 text-primary',
    category: ToolCategory.IMAGE
  },
  {
    id: 'bg-remove',
    name: 'Bg Remove',
    description: 'Elimina el fondo de productos o personas automáticamente en segundos.',
    icon: 'imagesmode',
    color: 'bg-blue-500/10 text-blue-400',
    category: ToolCategory.IMAGE
  },
  {
    id: 'realtime-gen',
    name: 'Real-Time Gen',
    description: 'Genera variaciones de creativos infinitas mientras escribes tu prompt.',
    icon: 'bolt',
    color: 'bg-green-500/10 text-green-400',
    category: ToolCategory.IMAGE
  },
  {
    id: 'text-to-ad',
    name: 'Text to Ad',
    description: 'Convierte descripciones de texto simples en anuncios completos listos para publicar.',
    icon: 'keyboard',
    color: 'bg-purple-500/10 text-purple-400',
    category: ToolCategory.VIDEO
  },
  {
    id: 'magic-eraser',
    name: 'Magic Eraser',
    description: 'Borra objetos no deseados, textos o imperfecciones de tus fotografías.',
    icon: 'ink_eraser',
    color: 'bg-pink-500/10 text-pink-400',
    category: ToolCategory.IMAGE
  },
  {
    id: 'video-enhancer',
    name: 'Video Enhancer',
    description: 'Mejora la calidad de tus clips de video y estabiliza el movimiento.',
    icon: 'video_settings',
    color: 'bg-orange-500/10 text-orange-400',
    category: ToolCategory.VIDEO
  },
  {
    id: 'copy-gen',
    name: 'Ad Copy Gen',
    description: 'Redacta textos persuasivos para Facebook, Instagram y Google Ads.',
    icon: 'description',
    color: 'bg-teal-500/10 text-teal-400',
    category: ToolCategory.COPYWRITING
  }
];

const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<ToolCategory>(ToolCategory.ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  const filteredTools = useMemo(() => {
    return TOOLS.filter(tool => {
      const matchesCategory = activeCategory === ToolCategory.ALL || tool.category === activeCategory;
      const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="flex h-screen w-full bg-background-dark overflow-hidden text-white font-display">
      <Sidebar />

      <main className="flex-1 h-full overflow-y-auto relative p-8 md:p-12 lg:p-16">
        {/* Decorative Gradient */}
        <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>

        <div className="relative max-w-[1400px] mx-auto flex flex-col gap-10">
          {/* Header */}
          <div className="flex flex-col gap-4 max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              Herramientas de IA
            </h1>
            <p className="text-muted-text text-lg font-normal">
              Potencia tus anuncios con nuestras utilidades de inteligencia artificial diseñadas para maximizar el rendimiento.
            </p>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-surface-dark/50 border border-border-dark p-2 rounded-xl backdrop-blur-sm">
            <div className="flex-1 w-full md:max-w-md">
              <label className="relative flex w-full items-center group">
                <span className="absolute left-4 text-muted-text material-symbols-outlined group-focus-within:text-primary transition-colors">search</span>
                <input 
                  type="text"
                  placeholder="Buscar herramientas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 bg-background-dark border border-border-dark rounded-lg pl-12 pr-4 text-white placeholder-muted-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </label>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 px-2 no-scrollbar">
              {Object.values(ToolCategory).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center justify-center px-4 h-10 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeCategory === cat 
                      ? 'bg-primary text-white' 
                      : 'bg-background-dark border border-border-dark text-muted-text hover:text-white hover:border-muted-text'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTools.map((tool) => (
              <ToolCard 
                key={tool.id} 
                tool={tool} 
                onClick={() => setSelectedTool(tool)}
              />
            ))}

            {/* Coming Soon Card */}
            <div className="group flex flex-col gap-4 rounded-xl border border-dashed border-border-dark bg-transparent p-6 items-center justify-center text-center opacity-40 hover:opacity-100 transition-all">
              <div className="size-12 rounded-full bg-border-dark flex items-center justify-center text-muted-text">
                <span className="material-symbols-outlined text-[24px]">add</span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-white text-base font-bold">Próximamente</h3>
                <p className="text-muted-text text-sm">Más herramientas en camino</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Tool Modal */}
      {selectedTool && (
        <ToolModal 
          tool={selectedTool} 
          onClose={() => setSelectedTool(null)} 
        />
      )}
    </div>
  );
};

export default App;
