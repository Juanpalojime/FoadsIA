
import { useState } from 'react';
import { Sparkles, Image as ImageIcon, Wand2, Download, Settings2, ChevronDown, RefreshCw, AlertCircle, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { api } from '../services/api';
import { db } from '../services/db';

export default function GenerateImages() {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Advanced Settings
    const [steps, setSteps] = useState(4);
    const [guidance, setGuidance] = useState(0.0);
    const [negativePrompt, setNegativePrompt] = useState('');

    const handleMagicPrompt = async () => {
        if (!prompt || isOptimizing) return;
        setIsOptimizing(true);
        try {
            const res = await api.magicPrompt(prompt);
            if (res.status === 'success' && res.prompt) {
                setPrompt(res.prompt);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleGenerate = async () => {
        if (!prompt || isGenerating) return;

        setIsGenerating(true);
        setResultImage(null);
        setError(null);

        try {
            const response = await api.generateImage(prompt, aspectRatio, steps, guidance, negativePrompt);
            if (response.status === 'success' && response.image) {
                setResultImage(response.image);
                await db.addAsset({
                    type: 'image',
                    content: response.image,
                    prompt: prompt,
                    createdAt: Date.now(),
                });
            } else {
                setError(response.message || 'La generación falló. Intenta con un prompt diferente.');
            }
        } catch (error) {
            console.error('Generation Error:', error);
            setError('Error de comunicación con el servidor de IA.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 pb-12">
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black mb-1 flex items-center gap-3">
                        <Sparkles className="text-[var(--primary)] drop-shadow-[0_0_8px_var(--primary-glow)]" />
                        Imagen Pro Hub
                    </h1>
                    <p className="text-[var(--text-secondary)] font-medium">Renderizado fotorrealista de alto nivel impulsado por SDXL.</p>
                </div>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-2 text-red-500 text-xs font-bold shadow-lg"
                    >
                        <AlertCircle size={14} />
                        {error}
                    </motion.div>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Controls */}
                <aside className="lg:col-span-4 space-y-6">
                    <div className="bg-[var(--bg-card)] border border-[var(--border-light)] rounded-[2.5rem] p-8 space-y-8 shadow-2xl overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)]/5 blur-3xl rounded-full translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-1000" />

                        <div className="flex flex-col gap-4 relative z-10">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Prompt Creativo</label>
                                <button
                                    onClick={handleMagicPrompt}
                                    disabled={!prompt || isOptimizing}
                                    className="px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5 hover:bg-[var(--primary)]/20 transition-all disabled:opacity-30 active:scale-95"
                                >
                                    {isOptimizing ? <RefreshCw size={12} className="animate-spin" /> : <Wand2 size={12} />}
                                    Mejorar con AI
                                </button>
                            </div>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Escribe tu visión aquí... (ej: 'Un deportivo futurista atravesando la ciudad neon en lluvia')"
                                className="w-full h-40 bg-[var(--bg-input)]/50 border border-[var(--border-light)] rounded-2xl p-5 text-sm font-medium focus:border-[var(--primary)]/50 outline-none resize-none transition-all leading-relaxed shadow-inner placeholder:text-[var(--text-tertiary)]/50"
                            />
                        </div>

                        <div className="flex flex-col gap-4 relative z-10">
                            <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] px-1">Formato de Salida</label>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: '1:1', label: '1:1', desc: 'SQUARE' },
                                    { id: '16:9', label: '16:9', desc: 'CINÉ' },
                                    { id: '9:16', label: '9:16', desc: 'REEL/STORY' },
                                ].map((ratio) => (
                                    <button
                                        key={ratio.id}
                                        onClick={() => setAspectRatio(ratio.id)}
                                        className={clsx(
                                            'flex flex-col items-center gap-1 py-3 px-2 rounded-2xl border transition-all transform active:scale-95',
                                            aspectRatio === ratio.id
                                                ? 'bg-gradient-to-tr from-[var(--primary)] to-[var(--accent)] border-transparent text-white shadow-lg shadow-[var(--primary-glow)]'
                                                : 'bg-[var(--bg-input)] border-[var(--border-light)] text-[var(--text-tertiary)] hover:border-white/20'
                                        )}
                                    >
                                        <span className="text-xs font-black">{ratio.label}</span>
                                        <span className="text-[9px] font-bold opacity-60 tracking-tighter">{ratio.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Advanced Settings */}
                        <div className="border-t border-[var(--border-light)] pt-6 relative z-10">
                            <button
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="w-full flex items-center justify-between text-[10px] font-black text-[var(--text-tertiary)] hover:text-white transition-colors uppercase tracking-[0.2em] px-1 group/btn"
                            >
                                <span className="flex items-center gap-2">
                                    <Settings2 size={14} className="group-hover/btn:rotate-90 transition-transform duration-500" />
                                    Avanzado
                                </span>
                                <ChevronDown size={14} className={clsx("transition-transform duration-500", showAdvanced && "rotate-180")} />
                            </button>

                            <AnimatePresence>
                                {showAdvanced && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="py-6 space-y-6">
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest px-1">
                                                    <span>Quality Steps</span>
                                                    <span className="text-[var(--primary)]">{steps}</span>
                                                </div>
                                                <input
                                                    type="range" min="1" max="50" value={steps}
                                                    onChange={(e) => setSteps(parseInt(e.target.value))}
                                                    className="w-full h-1.5 bg-[var(--bg-input)] rounded-full appearance-none cursor-pointer accent-[var(--primary)]"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest px-1">
                                                    <span>Prompt Strength</span>
                                                    <span className="text-[var(--primary)]">{guidance}</span>
                                                </div>
                                                <input
                                                    type="range" min="0" max="10" step="0.5" value={guidance}
                                                    onChange={(e) => setGuidance(parseFloat(e.target.value))}
                                                    className="w-full h-1.5 bg-[var(--bg-input)] rounded-full appearance-none cursor-pointer accent-[var(--primary)]"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest px-1">Filtro Negativo</label>
                                                <textarea
                                                    value={negativePrompt}
                                                    onChange={(e) => setNegativePrompt(e.target.value)}
                                                    placeholder="Ej: borroso, deforme, texto, marca de agua..."
                                                    className="w-full h-24 bg-[var(--bg-input)] border border-[var(--border-light)] rounded-2xl p-4 text-xs font-medium focus:border-[var(--primary)]/50 outline-none resize-none transition-all shadow-inner"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={!prompt || isGenerating}
                            className="w-full py-5 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] disabled:opacity-30 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-[var(--primary-glow)] flex items-center justify-center gap-3 mt-4 active:scale-95 group overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            {isGenerating ? (
                                <>
                                    <RefreshCw className="animate-spin" size={18} />
                                    Renderizando...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={18} />
                                    Generar Píxeles
                                </>
                            )}
                        </button>
                    </div>
                </aside>

                {/* Right: Results */}
                <main className="lg:col-span-8">
                    <div className="bg-[var(--bg-card)] border border-[var(--border-light)] rounded-[3rem] overflow-hidden relative flex flex-col min-h-[500px] lg:h-[750px] shadow-2xl group/result">
                        {!resultImage && !isGenerating ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-tertiary)] p-12 text-center select-none">
                                <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mb-8 border border-white/5 shadow-inner group-hover/result:scale-110 transition-transform duration-700">
                                    <ImageIcon size={40} className="opacity-10" />
                                </div>
                                <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Estudio en Espera</h3>
                                <p className="text-sm max-w-xs font-medium opacity-50">Configura tu prompt y presiona generar para ver la magia de Juggernaut XL.</p>
                            </div>
                        ) : (
                            <div className="flex-1 relative flex items-center justify-center p-6 bg-black/40">
                                <AnimatePresence>
                                    {isGenerating && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[var(--bg-main)]/80 backdrop-blur-xl"
                                        >
                                            <div className="relative w-24 h-24 mb-8">
                                                <div className="absolute inset-0 border-4 border-[var(--primary)]/10 rounded-full"></div>
                                                <div className="absolute inset-0 border-4 border-t-[var(--primary)] border-r-[var(--accent)] rounded-full animate-spin"></div>
                                                <div className="absolute inset-4 bg-gradient-to-tr from-[var(--primary)]/20 to-[var(--accent)]/20 rounded-full flex items-center justify-center">
                                                    <RefreshCw size={24} className="text-white animate-pulse" />
                                                </div>
                                            </div>
                                            <span className="text-base font-black uppercase tracking-[0.25em] text-white">Generando Neuronal...</span>
                                            <p className="text-xs text-[var(--text-tertiary)] mt-2 font-bold uppercase tracking-widest">Ajustando VRAM & Parámetros</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {resultImage && !isGenerating && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, filter: 'blur(20px)' }}
                                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                        className="h-full w-full flex items-center justify-center relative"
                                    >
                                        <img
                                            src={resultImage}
                                            alt="Generated content"
                                            className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_100px_-20px_var(--primary-glow)]"
                                        />

                                        {/* Action Controls */}
                                        <div className="absolute bottom-8 right-8 flex gap-4">
                                            <button
                                                className="p-4 bg-[var(--bg-card)]/80 hover:bg-white hover:text-black backdrop-blur-xl rounded-2xl text-white transition-all border border-white/10 shadow-2xl active:scale-90"
                                                title="Maximizar"
                                                onClick={() => window.open(resultImage, '_blank')}
                                            >
                                                <Maximize2 size={20} />
                                            </button>
                                            <button
                                                className="p-4 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] backdrop-blur-xl rounded-2xl text-white transition-all shadow-2xl shadow-[var(--primary-glow)] hover:scale-105 active:scale-90 flex items-center gap-2"
                                                title="Descargar Alta Resolución"
                                                onClick={() => {
                                                    const link = document.createElement('a');
                                                    link.href = resultImage;
                                                    link.download = `EnfoadsIA-PRO-${Date.now()}.png`;
                                                    link.click();
                                                }}
                                            >
                                                <Download size={20} />
                                                <span className="text-xs font-black uppercase tracking-widest">HD</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
