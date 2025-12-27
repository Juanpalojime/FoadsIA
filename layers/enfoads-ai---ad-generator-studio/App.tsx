
import React, { useState, useEffect } from 'react';
import { AdConfig, AdVariation, AspectRatio } from './types';
import { generateAdVariations } from './services/geminiService';

// --- Sub-components ---

const Toggle = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (v: boolean) => void }) => (
  <label className="inline-flex items-center cursor-pointer justify-between">
    <span className="ms-1 text-sm font-medium text-white">{label}</span>
    <input checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" type="checkbox" />
    <div className="relative w-11 h-6 bg-background-dark peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
  </label>
);

const IconButton = ({ icon, title, color = "text-text-secondary" }: { icon: string, title: string, color?: string }) => (
  <button className={`p-2 hover:bg-background-dark rounded-lg ${color} hover:text-white transition-colors`} title={title}>
    <span className="material-symbols-outlined">{icon}</span>
  </button>
);

const AspectButton = ({ icon, label, active, onClick }: { icon: string, label: string, active: boolean, onClick: () => void }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1 min-w-[50px] group">
    <div className={`w-10 h-10 border-2 rounded flex items-center justify-center transition-all ${
      active ? 'border-primary bg-primary/20' : 'border-text-secondary group-hover:border-white bg-transparent'
    }`}>
      <span className={`material-symbols-outlined text-xs ${active ? 'text-primary' : 'text-text-secondary group-hover:text-white'}`}>{icon}</span>
    </div>
    <span className={`text-xs font-medium ${active ? 'text-white' : 'text-text-secondary group-hover:text-white'}`}>{label}</span>
  </button>
);

// Fix: Defining AdCard with React.FC ensures that React-specific props like 'key' are correctly handled during JSX mapping.
const AdCard: React.FC<{ variation: AdVariation, isActive: boolean, onSelect: () => void }> = ({ variation, isActive, onSelect }) => (
  <div 
    onClick={onSelect}
    className={`group relative bg-panel-dark rounded-xl overflow-hidden cursor-pointer transition-all border-2 ${
      isActive ? 'border-primary shadow-[0_0_20px_rgba(110,48,232,0.15)]' : 'border-border-dark hover:border-primary/50'
    }`}
  >
    <div className="aspect-video w-full bg-gray-800 relative overflow-hidden">
      <img className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" src={variation.imageUrl} alt={variation.headline} />
      {isActive && <div className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded shadow-md">Selected</div>}
    </div>
    <div className="p-4">
      <h4 className="text-white font-medium truncate">{variation.headline}</h4>
      <p className="text-text-secondary text-xs mt-1 truncate">{variation.description}</p>
      <div className="flex gap-2 mt-4">
        <button className="flex-1 py-2 text-sm bg-background-dark hover:bg-border-dark text-white rounded border border-border-dark transition-colors">Edit</button>
        <button className={`flex-1 py-2 text-sm rounded transition-colors ${isActive ? 'bg-primary text-white' : 'bg-background-dark text-white border border-border-dark hover:text-primary hover:border-primary/50'}`}>
          {isActive ? 'Selected' : 'Select'}
        </button>
      </div>
    </div>
  </div>
);

const Mockup = ({ ad, ratio }: { ad?: AdVariation, ratio: AspectRatio }) => {
  if (!ad) {
    return (
      <div className="w-[260px] h-[520px] bg-panel-dark border-4 border-gray-800 rounded-[3rem] flex items-center justify-center text-text-secondary p-8 text-center text-sm">
        Generate and select a variation to preview.
      </div>
    );
  }

  const containerClass = ratio === AspectRatio.PORTRAIT 
    ? 'w-[260px] h-[520px]' 
    : ratio === AspectRatio.SQUARE 
    ? 'w-[280px] h-[280px]' 
    : 'w-[320px] h-[180px]';

  return (
    <div className={`relative ${containerClass} bg-black rounded-[3rem] border-4 border-gray-800 shadow-2xl overflow-hidden ring-1 ring-white/10 transition-all duration-300`}>
      {ratio === AspectRatio.PORTRAIT && <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-black rounded-b-xl z-20"></div>}
      <div className="w-full h-full bg-white relative">
        <div className="absolute top-0 left-0 w-full h-full bg-black">
          <img className="w-full h-full object-cover opacity-90" src={ad.imageUrl} alt="Ad background" />
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
            <div className="flex gap-2 items-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 border border-white"></div>
              <span className="text-white text-sm font-bold shadow-black drop-shadow-md">BrandName</span>
            </div>
            <span className="material-symbols-outlined text-white drop-shadow-md">close</span>
          </div>
          <div className="absolute bottom-6 left-4 right-4 z-10">
            <h2 className="text-white text-xl font-black italic drop-shadow-lg leading-tight mb-2 uppercase">{ad.headline}</h2>
            <p className="text-white text-xs drop-shadow-md mb-4 line-clamp-2">{ad.description}</p>
            <button className="w-full bg-white text-black font-bold py-2.5 rounded-full text-xs hover:bg-gray-100 transition-colors">
              {ad.cta}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Shared Components ---

const NavBtn = ({ icon, label, active = false }: { icon: string, label: string, active?: boolean }) => (
  <a 
    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${
      active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-secondary hover:text-white hover:bg-panel-dark'
    }`} 
    href="#"
  >
    <span className={`material-symbols-outlined ${active ? 'fill-1' : 'group-hover:text-primary'}`}>{icon}</span>
    <span className="text-sm font-medium">{label}</span>
  </a>
);

const Sidebar = () => (
  <aside className="w-[280px] flex-shrink-0 flex flex-col border-r border-border-dark bg-background-dark h-full">
    <div className="p-6 pb-2">
      <h1 className="text-white text-xl font-bold tracking-tight">ENFOADS AI</h1>
      <p className="text-text-secondary text-xs font-normal">Ad Generator Studio</p>
    </div>
    <div className="flex flex-col gap-2 p-4 flex-1 overflow-y-auto">
      <NavBtn icon="dashboard" label="Dashboard" />
      <NavBtn icon="add_circle" label="Crear Anuncio" active />
      <NavBtn icon="folder_open" label="Library" />
      <NavBtn icon="settings" label="Settings" />
      <NavBtn icon="help" label="Help" />
    </div>
    <div className="p-4 border-t border-border-dark">
      <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:text-white transition-colors cursor-pointer">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-400 p-[1px]">
          <div className="w-full h-full rounded-full bg-background-dark flex items-center justify-center">
            <span className="material-symbols-outlined text-sm">person</span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-white">Jane Doe</span>
          <span className="text-xs text-text-secondary">Pro Plan</span>
        </div>
      </div>
    </div>
  </aside>
);

export default function App() {
  const [config, setConfig] = useState<AdConfig>({
    tone: 'Professional',
    audience: 'Gen Z Gamers',
    goal: 'Conversion / Sales',
    creativity: 75,
    brandSafety: true,
    includeLogo: false
  });
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [variations, setVariations] = useState<AdVariation[]>([]);
  const [selectedVarIndex, setSelectedVarIndex] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.PORTRAIT);

  const selectedAd = variations[selectedVarIndex];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const results = await generateAdVariations(prompt, config);
      setVariations(results);
      setSelectedVarIndex(0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display h-screen flex overflow-hidden">
      <Sidebar />
      
      <main className="flex flex-1 overflow-hidden relative">
        {/* Configuration Panel */}
        <section className="w-[320px] flex-shrink-0 bg-panel-dark/50 border-r border-border-dark flex flex-col h-full overflow-y-auto">
          <div className="p-5 border-b border-border-dark">
            <h2 className="text-lg font-bold text-white">Configuration</h2>
            <p className="text-text-secondary text-sm">Define campaign parameters.</p>
          </div>
          <div className="p-5 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium">Tone of Voice</label>
              <div className="relative">
                <select 
                  className="w-full bg-background-dark border border-border-dark text-white text-sm rounded-lg focus:ring-primary focus:border-primary block p-3 pr-10 appearance-none"
                  value={config.tone}
                  onChange={(e) => setConfig({ ...config, tone: e.target.value })}
                >
                  <option>Professional</option>
                  <option>Witty & Fun</option>
                  <option>Urgent</option>
                  <option>Empathetic</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-secondary">
                  <span className="material-symbols-outlined text-sm">expand_more</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium">Target Audience</label>
              <div className="relative">
                <select 
                  className="w-full bg-background-dark border border-border-dark text-white text-sm rounded-lg focus:ring-primary focus:border-primary block p-3 pr-10 appearance-none"
                  value={config.audience}
                  onChange={(e) => setConfig({ ...config, audience: e.target.value })}
                >
                  <option>Gen Z Gamers</option>
                  <option>Corporate Decision Makers</option>
                  <option>Fitness Enthusiasts</option>
                  <option>New Parents</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-secondary">
                  <span className="material-symbols-outlined text-sm">expand_more</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium">Ad Goal</label>
              <div className="relative">
                <select 
                  className="w-full bg-background-dark border border-border-dark text-white text-sm rounded-lg focus:ring-primary focus:border-primary block p-3 pr-10 appearance-none"
                  value={config.goal}
                  onChange={(e) => setConfig({ ...config, goal: e.target.value })}
                >
                  <option>Conversion / Sales</option>
                  <option>Brand Awareness</option>
                  <option>Lead Generation</option>
                  <option>App Installs</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-secondary">
                  <span className="material-symbols-outlined text-sm">expand_more</span>
                </div>
              </div>
            </div>

            <div className="h-px bg-border-dark w-full my-2"></div>

            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <label className="text-white text-sm font-medium">Creativity Level</label>
                <span className="text-primary text-xs font-bold">{config.creativity > 70 ? 'High' : config.creativity > 30 ? 'Medium' : 'Low'}</span>
              </div>
              <input 
                className="w-full h-2 bg-background-dark rounded-lg appearance-none cursor-pointer accent-primary" 
                max="100" min="0" type="range" 
                value={config.creativity}
                onChange={(e) => setConfig({ ...config, creativity: parseInt(e.target.value) })}
              />
              <div className="flex justify-between text-xs text-text-secondary">
                <span>Safe</span>
                <span>Experimental</span>
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-2">
              <Toggle 
                label="Brand Safety Filter" 
                checked={config.brandSafety} 
                onChange={(v) => setConfig({ ...config, brandSafety: v })} 
              />
              <Toggle 
                label="Include Logo" 
                checked={config.includeLogo} 
                onChange={(v) => setConfig({ ...config, includeLogo: v })} 
              />
            </div>
          </div>
        </section>

        {/* Central Creative Canvas */}
        <section className="flex-1 flex flex-col h-full bg-background-dark overflow-y-auto relative">
          <div className="sticky top-0 z-10 bg-background-dark/95 backdrop-blur-sm p-6 border-b border-border-dark flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Creative Canvas</h2>
              <p className="text-text-secondary text-sm">Input your prompt and generate variations.</p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-panel-dark text-white hover:bg-border-dark border border-border-dark text-sm transition-all">
                <span className="material-symbols-outlined text-[18px]">history</span> History
              </button>
              <button 
                onClick={() => { setPrompt(''); setVariations([]); }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-panel-dark text-white hover:bg-border-dark border border-border-dark text-sm transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span> Clear
              </button>
            </div>
          </div>

          <div className="p-6 md:p-8 max-w-5xl mx-auto w-full flex flex-col gap-8 pb-32">
            <div className="bg-panel-dark rounded-xl p-4 border border-border-dark shadow-xl">
              <div className="relative">
                <textarea 
                  className="w-full bg-background-dark border border-border-dark rounded-lg p-4 text-white text-lg placeholder:text-text-secondary/50 focus:ring-2 focus:ring-primary focus:border-transparent resize-none h-32" 
                  placeholder="Describe your ad campaign... e.g. 'A futuristic sneaker floating in neon space, promoting speed and comfort, cyberpunk style'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <div className="absolute bottom-3 right-3 text-xs text-text-secondary">{prompt.length}/500</div>
              </div>
              <div className="flex justify-between items-center mt-4">
                <div className="flex gap-2">
                  <IconButton icon="image" title="Upload Reference" />
                  <IconButton icon="mic" title="Voice Input" />
                  <IconButton icon="auto_awesome" title="Add Magic" color="text-yellow-400" />
                </div>
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium shadow-lg shadow-primary/25 transition-all transform active:scale-95 disabled:opacity-50"
                >
                  <span className={`material-symbols-outlined ${isGenerating ? 'animate-spin' : ''}`}>
                    {isGenerating ? 'autorenew' : 'shutter_speed'}
                  </span>
                  {isGenerating ? 'Generating...' : 'Generate with AI'}
                </button>
              </div>
            </div>

            {variations.length > 0 && (
              <div>
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  Generated Results <span className="text-xs font-normal text-text-secondary bg-panel-dark px-2 py-0.5 rounded-full border border-border-dark">{variations.length} variations</span>
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {variations.map((v, idx) => (
                    <AdCard 
                      key={v.id} 
                      variation={v} 
                      isActive={selectedVarIndex === idx} 
                      onSelect={() => setSelectedVarIndex(idx)} 
                    />
                  ))}
                </div>
              </div>
            )}

            {isGenerating && (
              <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="animate-pulse">Gemini is brainstorming your creative concepts...</p>
              </div>
            )}
          </div>
        </section>

        {/* Right Preview & Metadata Panel */}
        <section className="w-[360px] flex-shrink-0 bg-panel-dark/30 border-l border-border-dark flex flex-col h-full overflow-y-auto">
          <div className="p-5 border-b border-border-dark">
            <h2 className="text-lg font-bold text-white">Preview</h2>
            <p className="text-text-secondary text-sm">Visualize across platforms.</p>
          </div>
          
          <div className="p-5 pb-0">
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              <AspectButton icon="smartphone" label="9:16" active={aspectRatio === AspectRatio.PORTRAIT} onClick={() => setAspectRatio(AspectRatio.PORTRAIT)} />
              <AspectButton icon="crop_square" label="1:1" active={aspectRatio === AspectRatio.SQUARE} onClick={() => setAspectRatio(AspectRatio.SQUARE)} />
              <AspectButton icon="rectangle" label="16:9" active={aspectRatio === AspectRatio.LANDSCAPE} onClick={() => setAspectRatio(AspectRatio.LANDSCAPE)} />
            </div>
          </div>

          <div className="px-8 pb-6 flex flex-1 justify-center items-start overflow-hidden">
            <Mockup ad={selectedAd} ratio={aspectRatio} />
          </div>

          <div className="mt-auto bg-panel-dark border-t border-border-dark p-5">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center pb-4 border-b border-border-dark/50">
                <div className="flex flex-col">
                  <span className="text-text-secondary text-xs uppercase tracking-wider font-semibold">Est. Tokens</span>
                  <span className="text-white text-xl font-bold font-mono">450</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-text-secondary text-xs uppercase tracking-wider font-semibold">Cost</span>
                  <span className="text-white text-xl font-bold font-mono">$0.12</span>
                </div>
              </div>
              <button className="w-full py-4 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2">
                Export Ad <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
