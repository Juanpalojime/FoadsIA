
import React, { useState } from 'react';
import { Sparkles, Trash2, History, Smartphone, Square, Monitor, ArrowRight, Zap, RefreshCw, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdConfig, AdVariation, AspectRatio } from '../types';
import { generateAdVariations } from '../services/gemini';
import clsx from 'clsx';

// --- Sub-components ---

const Toggle = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (v: boolean) => void }) => (
    <label className="flex items-center cursor-pointer justify-between">
        <span className="text-sm font-medium text-[var(--text-secondary)]">{label}</span>
        <div className="relative inline-flex items-center">
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
            <div className="w-11 h-6 bg-[var(--bg-input)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
        </div>
    </label>
);

const AspectButton = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
    <button onClick={onClick} className="flex flex-col items-center gap-1 min-w-[50px] group">
        <div className={clsx(
            "w-10 h-10 border-2 rounded flex items-center justify-center transition-all",
            active ? 'border-[var(--primary)] bg-[var(--primary)]/20' : 'border-[var(--border-light)] group-hover:border-white bg-transparent'
        )}>
            <Icon size={16} className={active ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)] group-hover:text-white'} />
        </div>
        <span className={clsx("text-[10px] font-bold uppercase", active ? 'text-white' : 'text-[var(--text-secondary)] group-hover:text-white')}>{label}</span>
    </button>
);

const AdCard: React.FC<{ variation: AdVariation, isActive: boolean, onSelect: () => void }> = ({ variation, isActive, onSelect }) => (
    <div
        onClick={onSelect}
        className={clsx(
            "group relative bg-[var(--bg-card)] rounded-xl overflow-hidden cursor-pointer transition-all border-2",
            isActive ? 'border-[var(--primary)] shadow-[var(--shadow-glow)]' : 'border-[var(--border-light)] hover:border-[var(--primary)]/50'
        )}
    >
        <div className="aspect-video w-full bg-gray-800 relative overflow-hidden">
            <img className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" src={variation.imageUrl} alt={variation.headline} />
            {isActive && <div className="absolute top-3 right-3 bg-[var(--primary)] text-white text-[10px] font-bold px-2 py-1 rounded shadow-md uppercase">Seleccionado</div>}
        </div>
        <div className="p-4">
            <h4 className="text-white font-bold truncate">{variation.headline}</h4>
            <p className="text-[var(--text-secondary)] text-xs mt-1 truncate">{variation.description}</p>
            <div className="flex gap-2 mt-4">
                <button className="flex-1 py-1.5 text-[10px] font-bold bg-[var(--bg-input)] hover:bg-[var(--bg-hover)] text-white rounded border border-[var(--border-light)] transition-colors uppercase">Editar</button>
                <button className={clsx(
                    "flex-1 py-1.5 text-[10px] font-bold rounded transition-colors uppercase",
                    isActive ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-input)] text-white border border-[var(--border-light)] hover:text-[var(--primary)] hover:border-[var(--primary)]/50'
                )}>
                    {isActive ? 'Seleccionado' : 'Seleccionar'}
                </button>
            </div>
        </div>
    </div>
);

const Mockup = ({ ad, ratio }: { ad?: AdVariation, ratio: AspectRatio }) => {
    if (!ad) {
        return (
            <div className="w-[260px] h-[460px] bg-[var(--bg-card)] border-2 border-dashed border-[var(--border-light)] rounded-[2rem] flex items-center justify-center text-[var(--text-tertiary)] p-8 text-center text-xs">
                Genera y selecciona una variación para previsualizar.
            </div>
        );
    }

    const containerSizes: Record<AspectRatio, string> = {
        [AspectRatio.PORTRAIT]: 'w-[230px] h-[460px]',
        [AspectRatio.SQUARE]: 'w-[280px] h-[280px]',
        [AspectRatio.LANDSCAPE]: 'w-[320px] h-[180px]'
    };

    return (
        <div className={clsx(
            "relative bg-black shadow-2xl overflow-hidden ring-1 ring-white/10 transition-all duration-300",
            containerSizes[ratio],
            ratio === AspectRatio.PORTRAIT ? "rounded-[2.5rem] border-4 border-gray-900" : "rounded-xl border-2 border-gray-900"
        )}>
            {ratio === AspectRatio.PORTRAIT && <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-24 bg-gray-900 rounded-b-xl z-20"></div>}
            <div className="w-full h-full bg-black relative">
                <img className="w-full h-full object-cover opacity-80" src={ad.imageUrl} alt="Ad background" />
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                    <div className="flex gap-2 items-center">
                        <div className="w-6 h-6 rounded-full bg-[var(--primary)] border border-white flex items-center justify-center text-[10px] font-bold">E</div>
                        <span className="text-white text-[10px] font-bold shadow-black drop-shadow-md">EnfoadsIA</span>
                    </div>
                </div>
                <div className="absolute bottom-6 left-4 right-4 z-10">
                    <h2 className="text-white text-base font-black italic drop-shadow-lg leading-tight mb-1 uppercase line-clamp-2">{ad.headline}</h2>
                    <p className="text-white text-[9px] drop-shadow-md mb-3 line-clamp-2 opacity-90">{ad.description}</p>
                    <button className="w-full bg-white text-black font-bold py-2 rounded-full text-[10px] hover:bg-gray-100 transition-colors uppercase">
                        {ad.cta}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function AdCreator() {
    const [config, setConfig] = useState<AdConfig>({
        tone: 'Profesional',
        audience: 'Emprendedores',
        goal: 'Conversión / Ventas',
        creativity: 75,
        brandSafety: true,
        includeLogo: true
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
            alert("Error al generar. Asegúrate de tener configurada la API Key de Google.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="h-[calc(100vh-6rem)] flex gap-4 overflow-hidden">
            {/* Configuration Panel */}
            <aside className="w-72 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-xl flex flex-col h-full overflow-hidden shrink-0">
                <div className="p-4 border-b border-[var(--border-light)]">
                    <h2 className="text-sm font-bold flex items-center gap-2">
                        <Zap size={16} className="text-[var(--primary)]" />
                        Configuración
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 custom-scrollbar">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Tono de Voz</label>
                        <select
                            className="w-full bg-[var(--bg-input)] border border-[var(--border-light)] text-white text-xs rounded-lg p-2.5 outline-none focus:border-[var(--primary)] transition-colors"
                            value={config.tone}
                            onChange={(e) => setConfig({ ...config, tone: e.target.value })}
                        >
                            <option>Profesional</option>
                            <option>Divertido e Ingenioso</option>
                            <option>Urgente</option>
                            <option>Empático</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Audiencia Objetivo</label>
                        <select
                            className="w-full bg-[var(--bg-input)] border border-[var(--border-light)] text-white text-xs rounded-lg p-2.5 outline-none focus:border-[var(--primary)] transition-colors"
                            value={config.audience}
                            onChange={(e) => setConfig({ ...config, audience: e.target.value })}
                        >
                            <option>Emprendedores</option>
                            <option>Gen Z Gamers</option>
                            <option>Fitness</option>
                            <option>Padres Primerizos</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Objetivo</label>
                        <select
                            className="w-full bg-[var(--bg-input)] border border-[var(--border-light)] text-white text-xs rounded-lg p-2.5 outline-none focus:border-[var(--primary)] transition-colors"
                            value={config.goal}
                            onChange={(e) => setConfig({ ...config, goal: e.target.value })}
                        >
                            <option>Conversión / Ventas</option>
                            <option>Reconocimiento de Marca</option>
                            <option>Lead Generation</option>
                        </select>
                    </div>

                    <div className="h-px bg-[var(--border-light)] w-full"></div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                            <label className="text-[var(--text-secondary)]">Creatividad</label>
                            <span className="text-[var(--primary)]">{config.creativity > 70 ? 'Extremo' : config.creativity > 30 ? 'Balance' : 'Seguro'}</span>
                        </div>
                        <input
                            className="w-full h-1.5 bg-[var(--bg-input)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                            max="100" min="0" type="range"
                            value={config.creativity}
                            onChange={(e) => setConfig({ ...config, creativity: parseInt(e.target.value) })}
                        />
                    </div>

                    <div className="space-y-3 pt-2">
                        <Toggle label="Brand Safety" checked={config.brandSafety} onChange={(v) => setConfig({ ...config, brandSafety: v })} />
                        <Toggle label="Incluir Logo" checked={config.includeLogo} onChange={(v) => setConfig({ ...config, includeLogo: v })} />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col gap-4 overflow-hidden">
                <div className="flex-1 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-xl flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-[var(--border-light)] flex justify-between items-center bg-[var(--bg-main)]/30">
                        <div>
                            <h2 className="text-sm font-bold flex items-center gap-2">
                                <Sparkles size={16} className="text-yellow-400" />
                                Creative Studio
                            </h2>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 hover:bg-[var(--bg-hover)] rounded-lg text-[var(--text-secondary)] transition-all">
                                <History size={16} />
                            </button>
                            <button
                                onClick={() => { setPrompt(''); setVariations([]); }}
                                className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-[var(--text-secondary)] transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 custom-scrollbar">
                        <div className="relative group">
                            <textarea
                                className="w-full bg-[var(--bg-input)] border border-[var(--border-light)] rounded-xl p-4 text-white text-lg placeholder:text-[var(--text-tertiary)]/50 focus:border-[var(--primary)] outline-none resize-none h-32 transition-all shadow-inner"
                                placeholder="Describe tu campaña... ej: 'Un sneaker futurista flotando en el espacio flúor, estilo cyberpunk'"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                            <div className="absolute bottom-3 right-3 text-[10px] font-bold text-[var(--text-tertiary)] uppercase">{prompt.length}/500</div>

                            <div className="mt-3 flex justify-between items-center">
                                <div className="flex gap-2">
                                    <button className="p-2 bg-[var(--bg-input)] border border-[var(--border-light)] rounded-lg text-[var(--text-secondary)] hover:text-white transition-colors">
                                        <Layers size={16} />
                                    </button>
                                </div>
                                <button
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-[11px] font-black uppercase tracking-widest shadow-[var(--shadow-glow)] transition-all transform active:scale-95 disabled:opacity-50"
                                >
                                    {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                    {isGenerating ? 'Generando Ideas...' : 'Generar Variaciones AI'}
                                </button>
                            </div>
                        </div>

                        <AnimatePresence>
                            {variations.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4"
                                >
                                    <h3 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] flex items-center gap-2">
                                        Resultados Inteligentes
                                        <span className="bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-0.5 rounded-full border border-[var(--primary)]/20 text-[9px]">{variations.length} VARIACIONES</span>
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {variations.map((v, idx) => (
                                            <AdCard
                                                key={v.id}
                                                variation={v}
                                                isActive={selectedVarIndex === idx}
                                                onSelect={() => setSelectedVarIndex(idx)}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {isGenerating && variations.length === 0 && (
                            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                                <div className="relative w-16 h-16 mb-6">
                                    <div className="absolute inset-0 border-4 border-[var(--primary)]/10 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-t-[var(--primary)] rounded-full animate-spin"></div>
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute inset-4 bg-[var(--primary)]/20 rounded-full flex items-center justify-center"
                                    >
                                        <Zap size={14} className="text-[var(--primary)]" />
                                    </motion.div>
                                </div>
                                <h4 className="font-bold text-lg mb-1">Gemini está creando tu magia...</h4>
                                <p className="text-sm text-[var(--text-secondary)]">Diseñando conceptos creativos y visuales fotorrealistas.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Preview Panel */}
            <aside className="w-80 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-xl flex flex-col h-full overflow-hidden shrink-0">
                <div className="p-4 border-b border-[var(--border-light)]">
                    <h2 className="text-sm font-bold flex items-center gap-2">
                        <Monitor size={16} className="text-[var(--primary)]" />
                        Vista Previa
                    </h2>
                </div>

                <div className="p-4 flex flex-col gap-6 items-center">
                    <div className="flex gap-4 p-1 bg-[var(--bg-input)] rounded-xl border border-[var(--border-light)]">
                        <AspectButton icon={Smartphone} label="9:16" active={aspectRatio === AspectRatio.PORTRAIT} onClick={() => setAspectRatio(AspectRatio.PORTRAIT)} />
                        <AspectButton icon={Square} label="1:1" active={aspectRatio === AspectRatio.SQUARE} onClick={() => setAspectRatio(AspectRatio.SQUARE)} />
                        <AspectButton icon={Monitor} label="16:9" active={aspectRatio === AspectRatio.LANDSCAPE} onClick={() => setAspectRatio(AspectRatio.LANDSCAPE)} />
                    </div>

                    <div className="flex-1 flex items-center justify-center w-full min-h-[350px]">
                        <Mockup ad={selectedAd} ratio={aspectRatio} />
                    </div>
                </div>

                <div className="mt-auto p-4 bg-[var(--bg-main)]/50 border-t border-[var(--border-light)]">
                    <button className="w-full py-3 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-black text-xs uppercase tracking-widest shadow-[var(--shadow-glow)] transition-all flex items-center justify-center gap-2 group">
                        Exportar Proyecto
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </aside>
        </div>
    );
}
