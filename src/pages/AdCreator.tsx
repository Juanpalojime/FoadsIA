
import React, { useState } from 'react';
import { Sparkles, Trash2, History, Smartphone, Square, Monitor, ArrowRight, Zap, RefreshCw, Layers, ChevronDown, ChevronUp } from 'lucide-react';
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
    <button onClick={onClick} className="flex flex-col items-center gap-1 min-w-[50px] group transition-all">
        <div className={clsx(
            "w-10 h-10 border-2 rounded-xl flex items-center justify-center transition-all",
            active ? 'border-[var(--primary)] bg-[var(--primary)]/20 shadow-[0_0_10px_var(--primary-glow)]' : 'border-[var(--border-light)] group-hover:border-white/30 bg-transparent'
        )}>
            <Icon size={16} className={active ? 'text-[var(--primary)]' : 'text-[var(--text-tertiary)] group-hover:text-white'} />
        </div>
        <span className={clsx("text-[9px] font-bold uppercase tracking-tighter", active ? 'text-white' : 'text-[var(--text-tertiary)] group-hover:text-white')}>{label}</span>
    </button>
);

const AdCard: React.FC<{ variation: AdVariation, isActive: boolean, onSelect: () => void }> = ({ variation, isActive, onSelect }) => (
    <div
        onClick={onSelect}
        className={clsx(
            "group relative bg-[var(--bg-card)] rounded-[1.5rem] overflow-hidden cursor-pointer transition-all border-2",
            isActive ? 'border-[var(--primary)] shadow-[var(--shadow-glow)] scale-[0.98]' : 'border-[var(--border-light)] hover:border-[var(--primary)]/30'
        )}
    >
        <div className="aspect-[16/10] w-full bg-gray-900 relative overflow-hidden">
            <img className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" src={variation.imageUrl} alt={variation.headline} />
            {isActive && (
                <div className="absolute top-3 right-3 bg-[var(--primary)] text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-lg uppercase tracking-widest z-10">
                    Activo
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
        </div>
        <div className="p-5">
            <h4 className="text-white font-bold text-sm tracking-tight mb-1 truncate">{variation.headline}</h4>
            <p className="text-[var(--text-secondary)] text-[11px] leading-relaxed line-clamp-2 mb-4">{variation.description}</p>
            <div className="flex gap-2">
                <button className="flex-1 py-2 text-[10px] font-black bg-[var(--bg-input)] hover:bg-[var(--bg-hover)] text-white rounded-xl border border-[var(--border-light)] transition-all uppercase tracking-widest">Ajustar</button>
                <button className={clsx(
                    "flex-1 py-2 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest",
                    isActive ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-input)] text-white border border-[var(--border-light)]'
                )}>
                    {isActive ? 'Listo' : 'Usar'}
                </button>
            </div>
        </div>
    </div>
);

const Mockup = ({ ad, ratio }: { ad?: AdVariation, ratio: AspectRatio }) => {
    if (!ad) {
        return (
            <div className="w-full max-w-[260px] aspect-[9/16] bg-[var(--bg-card)] border-2 border-dashed border-[var(--border-light)] rounded-[2.5rem] flex flex-col items-center justify-center text-[var(--text-tertiary)] p-8 text-center text-xs animate-pulse">
                <Smartphone size={32} className="mb-4 opacity-20" />
                Selecciona una variación para previsualizar el diseño final.
            </div>
        );
    }

    const containerSizes: Record<AspectRatio, string> = {
        [AspectRatio.PORTRAIT]: 'w-[240px] aspect-[9/16]',
        [AspectRatio.SQUARE]: 'w-[280px] aspect-square',
        [AspectRatio.LANDSCAPE]: 'w-full max-w-[340px] aspect-video'
    };

    return (
        <div className={clsx(
            "relative bg-black shadow-2xl overflow-hidden ring-1 ring-white/10 transition-all duration-500",
            containerSizes[ratio],
            ratio === AspectRatio.PORTRAIT ? "rounded-[2.8rem] border-[6px] border-[#1a1a1e]" : "rounded-3xl border-4 border-[#1a1a1e]"
        )}>
            {ratio === AspectRatio.PORTRAIT && <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-24 bg-[#1a1a1e] rounded-b-2xl z-20"></div>}
            <div className="w-full h-full bg-black relative">
                <img className="w-full h-full object-cover opacity-80" src={ad.imageUrl} alt="Ad background" />
                <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
                    <div className="flex gap-2 items-center">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[var(--primary)] to-[var(--accent)] border border-white/20 flex items-center justify-center text-[10px] font-black">E</div>
                        <span className="text-white text-[10px] font-black tracking-widest drop-shadow-lg">ENFOADSIA</span>
                    </div>
                </div>
                <div className="absolute bottom-10 left-6 right-6 z-10">
                    <h2 className="text-white text-lg font-black italic drop-shadow-xl leading-tight mb-2 uppercase line-clamp-3">{ad.headline}</h2>
                    <p className="text-white text-[10px] drop-shadow-lg mb-4 line-clamp-2 opacity-90 font-medium">{ad.description}</p>
                    <button className="w-full bg-white text-black font-black py-3 rounded-2xl text-[11px] hover:bg-gray-100 transition-all uppercase tracking-[0.15em] shadow-xl active:scale-95">
                        {ad.cta}
                    </button>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />
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
    const [showConfig, setShowConfig] = useState(false);

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
        <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[calc(100vh-10rem)] pb-12">
            {/* Configuration Panel - Collapsible on Mobile */}
            <aside className={clsx(
                "lg:w-72 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-[2rem] flex flex-col transition-all duration-300 overflow-hidden shrink-0",
                showConfig ? "max-h-[1000px]" : "max-h-[64px] lg:max-h-none"
            )}>
                <div className="p-5 border-b border-[var(--border-light)] flex justify-between items-center bg-gradient-to-b from-white/5 to-transparent">
                    <h2 className="text-sm font-black flex items-center gap-2 uppercase tracking-widest">
                        <Zap size={16} className="text-[var(--primary)]" />
                        Configuración
                    </h2>
                    <button onClick={() => setShowConfig(!showConfig)} className="lg:hidden p-1 text-[var(--text-tertiary)]">
                        {showConfig ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] px-1">Tono de Voz</label>
                        <select
                            className="w-full bg-[var(--bg-input)] border border-[var(--border-light)] text-white text-xs font-bold rounded-xl px-4 py-3 outline-none focus:border-[var(--primary)]/50 transition-all appearance-none cursor-pointer"
                            value={config.tone}
                            onChange={(e) => setConfig({ ...config, tone: e.target.value })}
                        >
                            <option>Profesional</option>
                            <option>Divertido e Ingenioso</option>
                            <option>Urgente</option>
                            <option>Empático</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] px-1">Audiencia Objetivo</label>
                        <select
                            className="w-full bg-[var(--bg-input)] border border-[var(--border-light)] text-white text-xs font-bold rounded-xl px-4 py-3 outline-none focus:border-[var(--primary)]/50 transition-all appearance-none cursor-pointer"
                            value={config.audience}
                            onChange={(e) => setConfig({ ...config, audience: e.target.value })}
                        >
                            <option>Emprendedores</option>
                            <option>Gen Z Gamers</option>
                            <option>Fitness</option>
                            <option>Padres Primerizos</option>
                        </select>
                    </div>

                    <div className="h-px bg-[var(--border-light)] w-full opacity-50"></div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest px-1">
                            <label className="text-[var(--text-tertiary)]">Creatividad</label>
                            <span className="text-[var(--primary)]">{config.creativity > 70 ? 'AI Boosted' : config.creativity > 30 ? 'Balance' : 'Safe'}</span>
                        </div>
                        <input
                            className="w-full h-1.5 bg-[var(--bg-input)] rounded-full appearance-none cursor-pointer accent-[var(--primary)]"
                            max="100" min="0" type="range"
                            value={config.creativity}
                            onChange={(e) => setConfig({ ...config, creativity: parseInt(e.target.value) })}
                        />
                    </div>

                    <div className="space-y-4 pt-2">
                        <Toggle label="Brand Safety" checked={config.brandSafety} onChange={(v) => setConfig({ ...config, brandSafety: v })} />
                        <Toggle label="Incluir Logo" checked={config.includeLogo} onChange={(v) => setConfig({ ...config, includeLogo: v })} />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col gap-6">
                <div className="flex-1 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-[2.5rem] flex flex-col overflow-hidden shadow-xl lg:min-h-[500px]">
                    <div className="p-6 border-b border-[var(--border-light)] flex justify-between items-center bg-white/5 backdrop-blur-md">
                        <div>
                            <h2 className="text-base font-black flex items-center gap-2 uppercase tracking-widest">
                                <Sparkles size={18} className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                                Ad Creator Studio
                            </h2>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-3 hover:bg-[var(--bg-hover)] rounded-xl text-[var(--text-tertiary)] hover:text-white transition-all">
                                <History size={18} />
                            </button>
                            <button
                                onClick={() => { setPrompt(''); setVariations([]); }}
                                className="p-3 hover:bg-red-500/10 hover:text-red-500 rounded-xl text-[var(--text-tertiary)] transition-all"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 lg:p-10 flex flex-col gap-10 custom-scrollbar">
                        <div className="relative group">
                            <textarea
                                className="w-full bg-[var(--bg-input)]/50 border-2 border-[var(--border-light)] rounded-3xl p-6 lg:p-8 text-white text-lg lg:text-xl font-medium placeholder:text-[var(--text-tertiary)]/30 focus:border-[var(--primary)]/50 outline-none resize-none h-40 lg:h-48 transition-all shadow-2xl"
                                placeholder="¿Qué quieres anunciar hoy? Describe tu producto y estilo..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                            <div className="absolute bottom-6 right-8 text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest opacity-40">{prompt.length}/500</div>

                            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex gap-3">
                                    <button className="p-3.5 bg-[var(--bg-input)] border border-[var(--border-light)] rounded-2xl text-[var(--text-tertiary)] hover:text-white hover:border-white/20 transition-all active:scale-95 shadow-lg">
                                        <Layers size={18} />
                                    </button>
                                </div>
                                <button
                                    onClick={handleGenerate}
                                    disabled={isGenerating || !prompt.trim()}
                                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] hover:opacity-90 text-white text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-[var(--primary-glow)] transition-all transform active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                                >
                                    {isGenerating ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                                    {isGenerating ? 'Gemini está creando...' : 'Generar Campaña Pro'}
                                </button>
                            </div>
                        </div>

                        <AnimatePresence>
                            {variations.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center gap-4 px-2">
                                        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--border-light)] to-transparent" />
                                        <h3 className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.3em] text-center">
                                            IDEAS GENERADAS POR IA
                                        </h3>
                                        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--border-light)] to-transparent" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                        {isGenerating && (
                            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                                <div className="relative w-20 h-20 mb-8">
                                    <div className="absolute inset-0 border-4 border-[var(--primary)]/10 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-t-[var(--primary)] border-r-[var(--accent)] rounded-full animate-spin"></div>
                                    <div className="absolute inset-4 bg-gradient-to-tr from-[var(--primary)]/20 to-[var(--accent)]/20 rounded-full flex items-center justify-center">
                                        <Sparkles size={18} className="text-white animate-pulse" />
                                    </div>
                                </div>
                                <h4 className="font-black text-xl lg:text-2xl mb-2 tracking-tight">Gemini está en el laboratorio...</h4>
                                <p className="text-sm text-[var(--text-tertiary)] max-w-sm mx-auto font-medium">Diseñando anuncios de alto impacto optimizados para conversión.</p>
                            </div>
                        )}

                        {!isGenerating && variations.length === 0 && (
                            <div className="flex-1 flex flex-col items-center justify-center py-24 text-center opacity-30">
                                <Layers size={48} className="mb-6 text-[var(--text-tertiary)]" />
                                <p className="text-sm font-black uppercase tracking-widest">Escribe algo y presiona generar</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Preview Panel */}
            <aside className="lg:w-80 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-[2.5rem] flex flex-col shrink-0 shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-[var(--border-light)] flex items-center gap-3 bg-white/5">
                    <Monitor size={18} className="text-[var(--primary)]" />
                    <h2 className="text-sm font-black uppercase tracking-widest">Vista de Mockup</h2>
                </div>

                <div className="p-8 flex-1 flex flex-col gap-8 items-center justify-center">
                    <div className="flex gap-4 p-2 bg-[var(--bg-input)] rounded-2xl border border-[var(--border-light)] shadow-inner">
                        <AspectButton icon={Smartphone} label="Móvil" active={aspectRatio === AspectRatio.PORTRAIT} onClick={() => setAspectRatio(AspectRatio.PORTRAIT)} />
                        <AspectButton icon={Square} label="Feed" active={aspectRatio === AspectRatio.SQUARE} onClick={() => setAspectRatio(AspectRatio.SQUARE)} />
                        <AspectButton icon={Monitor} label="Web" active={aspectRatio === AspectRatio.LANDSCAPE} onClick={() => setAspectRatio(AspectRatio.LANDSCAPE)} />
                    </div>

                    <div className="flex-1 flex items-center justify-center w-full min-h-[400px]">
                        <Mockup ad={selectedAd} ratio={aspectRatio} />
                    </div>
                </div>

                <div className="p-8 bg-gradient-to-t from-white/5 to-transparent border-t border-[var(--border-light)]">
                    <button className="w-full py-5 rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[var(--primary-glow)] hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3 group">
                        Finalizar y Exportar
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </aside>
        </div>
    );
}

