import { useState } from 'react';
import { Sparkles, Image as ImageIcon, Wand2, Download, Settings2, ChevronDown, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { api } from '../services/api';
import { db } from '../services/db';
import '../styles/variables.css';

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
        <div className="max-w-6xl mx-auto h-full flex flex-col gap-6">
            <header className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
                    <Sparkles className="text-[var(--primary)]" />
                    Generador de Imágenes Pro
                </h1>
                <p className="text-[var(--text-secondary)]">Crea visuales fotorrealistas con Juggernaut XL v9</p>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-500 text-xs font-bold"
                    >
                        <AlertCircle size={14} />
                        {error}
                    </motion.div>
                )}
            </header>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                {/* Left: Controls */}
                <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
                    <div className="bg-[var(--bg-card)] border border-[var(--border-light)] rounded-2xl p-5 flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-[var(--text-secondary)] flex justify-between">
                                Prompt
                                <button
                                    onClick={handleMagicPrompt}
                                    disabled={!prompt || isOptimizing}
                                    className="text-[var(--primary)] text-xs flex items-center gap-1 hover:underline disabled:opacity-50 disabled:no-underline"
                                >
                                    {isOptimizing ? <RefreshCw size={12} className="animate-spin" /> : <Wand2 size={12} />}
                                    Magic Prompt
                                </button>
                            </label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Ej: Un astronauta montando un caballo en Marte, estilo cinematográfico..."
                                className="w-full h-32 bg-[var(--bg-input)] border border-[var(--border-light)] rounded-xl p-3 text-sm focus:border-[var(--primary)] outline-none resize-none transition-all leading-relaxed"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-[var(--text-secondary)] text-left">Relación de Aspecto</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: '1:1', label: '1:1 Square' },
                                    { id: '16:9', label: '16:9 Ciné' },
                                    { id: '9:16', label: '9:16 Reel' },
                                ].map((ratio) => (
                                    <button
                                        key={ratio.id}
                                        onClick={() => setAspectRatio(ratio.id)}
                                        className={clsx(
                                            'py-2.5 rounded-xl border text-xs font-medium transition-all',
                                            aspectRatio === ratio.id
                                                ? 'bg-[var(--primary)] border-[var(--primary)] text-white shadow-[var(--shadow-glow)]'
                                                : 'bg-[var(--bg-input)] border-[var(--border-light)] text-[var(--text-secondary)] hover:border-[var(--primary)]/50'
                                        )}
                                    >
                                        {ratio.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Advanced Settings */}
                        <div className="border-t border-[var(--border-light)] pt-4">
                            <button
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="w-full flex items-center justify-between text-xs font-bold text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors uppercase tracking-widest"
                            >
                                <span className="flex items-center gap-1.5"><Settings2 size={14} /> Configuración Avanzada</span>
                                <ChevronDown size={14} className={clsx("transition-transform", showAdvanced && "rotate-180")} />
                            </button>

                            <AnimatePresence>
                                {showAdvanced && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="py-4 space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[10px] text-[var(--text-secondary)]">
                                                    <span>PASOS (STEPS)</span>
                                                    <span>{steps}</span>
                                                </div>
                                                <input
                                                    type="range" min="1" max="50" value={steps}
                                                    onChange={(e) => setSteps(parseInt(e.target.value))}
                                                    className="w-full h-1.5 bg-[var(--bg-input)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[10px] text-[var(--text-secondary)]">
                                                    <span>GUIDANCE SCALE</span>
                                                    <span>{guidance}</span>
                                                </div>
                                                <input
                                                    type="range" min="0" max="10" step="0.5" value={guidance}
                                                    onChange={(e) => setGuidance(parseFloat(e.target.value))}
                                                    className="w-full h-1.5 bg-[var(--bg-input)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-[var(--text-secondary)] uppercase font-bold">Negative Prompt</label>
                                                <textarea
                                                    value={negativePrompt}
                                                    onChange={(e) => setNegativePrompt(e.target.value)}
                                                    placeholder="Ej: deformidades, borroso, baja calidad..."
                                                    className="w-full h-20 bg-[var(--bg-input)] border border-[var(--border-light)] rounded-lg p-2 text-xs focus:border-[var(--primary)] outline-none resize-none transition-all"
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
                            className="w-full py-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-[var(--shadow-glow)] flex items-center justify-center gap-2 mt-2"
                        >
                            {isGenerating ? (
                                <>
                                    <RefreshCw className="animate-spin" size={20} />
                                    Generando...
                                </>
                            ) : (
                                <>
                                    <ImageIcon size={20} />
                                    Generar Imagen
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Right: Results */}
                <div className="lg:col-span-8 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-2xl overflow-hidden relative flex flex-col min-h-[400px]">
                    {!resultImage && !isGenerating ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-tertiary)] p-12 text-center">
                            <div className="w-16 h-16 bg-[var(--bg-input)] rounded-full flex items-center justify-center mb-4">
                                <ImageIcon size={32} opacity={0.2} />
                            </div>
                            <p className="text-sm">Tu creación aparecerá aquí</p>
                            <p className="text-xs max-w-xs mt-2">Describe algo increíble y deja que la IA haga el resto.</p>
                        </div>
                    ) : (
                        <div className="flex-1 relative flex items-center justify-center p-4 bg-[var(--bg-input)]/30">
                            {isGenerating && (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full mb-4"
                                    />
                                    <span className="text-sm font-medium">Renderizando píxeles...</span>
                                </div>
                            )}
                            {resultImage && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="h-full w-full flex items-center justify-center"
                                >
                                    <img
                                        src={resultImage}
                                        alt="Generated content"
                                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                                    />
                                    {/* Download Button Overlay */}
                                    <button
                                        className="absolute bottom-6 right-6 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all border border-white/20 shadow-xl"
                                        title="Descargar Imagen"
                                        onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = resultImage;
                                            link.download = `EnfoadsIA-${Date.now()}.png`;
                                            link.click();
                                        }}
                                    >
                                        <Download size={20} />
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
