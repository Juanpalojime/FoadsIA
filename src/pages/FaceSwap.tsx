
import { useState } from 'react';
import { Upload, Save, Image as ImageIcon, Video as VideoIcon, RefreshCw, Download, AlertCircle, Zap, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { api } from '../services/api';
import { db } from '../services/db';

type MediaType = 'image' | 'video';

export default function FaceSwap() {
    const [mediaType, setMediaType] = useState<MediaType>('image');
    const [sourceImage, setSourceImage] = useState<string | null>(null);
    const [targetMedia, setTargetMedia] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setFile: (s: string) => void) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const b64 = await toBase64(file);
                setFile(b64);
                setResultImage(null);
                setError(null);
            } catch (err) {
                console.error("Error reading file", err);
            }
        }
    };

    const handleProcess = async () => {
        if (!sourceImage || !targetMedia) return;

        setIsProcessing(true);
        setError(null);
        try {
            const response = await api.faceSwap(sourceImage, targetMedia);
            if (response.status === 'success' && response.image) {
                setResultImage(response.image);
                await db.addAsset({
                    type: 'image',
                    content: response.image,
                    prompt: 'Face Swap Result',
                    createdAt: Date.now()
                });
            } else {
                setError(response.message || 'Error en el procesamiento');
            }
        } catch (err: any) {
            setError(err.message || 'Error de conexión');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 pb-12">
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black mb-1 flex items-center gap-3">
                        <Zap className="text-[var(--primary)] drop-shadow-[0_0_8px_var(--primary-glow)]" />
                        Face Swap Lab
                    </h1>
                    <p className="text-[var(--text-secondary)] font-medium">Intercambio de rostros de alta precisión impulsado por InsightFace.</p>
                </div>

                <div className="flex bg-[var(--bg-card)] p-1.5 rounded-2xl border border-[var(--border-light)] shadow-xl">
                    <button
                        onClick={() => { setMediaType('image'); setTargetMedia(null); setResultImage(null); }}
                        className={clsx(
                            "px-6 py-2.5 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all",
                            mediaType === 'image' ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary-glow)]" : "text-[var(--text-tertiary)] hover:text-white"
                        )}
                    >
                        <ImageIcon size={16} />
                        FOTO
                    </button>
                    <button
                        disabled
                        className="px-6 py-2.5 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-30 cursor-not-allowed text-[var(--text-tertiary)]"
                    >
                        <VideoIcon size={16} />
                        VIDEO
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left side inputs */}
                <div className="lg:col-span-4 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-light)] shadow-2xl relative group"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--primary)]/5 blur-2xl rounded-full translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-1000" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-[var(--text-tertiary)] flex items-center gap-2">
                            <span className="w-5 h-5 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">1</span>
                            Cara Origen
                        </h3>
                        <div className="aspect-square rounded-[2rem] border-2 border-dashed border-[var(--border-light)] bg-[var(--bg-input)]/50 hover:border-[var(--primary)]/50 transition-all flex flex-col items-center justify-center relative overflow-hidden group/upload cursor-pointer">
                            {sourceImage ? (
                                <img src={sourceImage} alt="Source" className="w-full h-full object-cover group-hover/upload:scale-105 transition-transform duration-700" />
                            ) : (
                                <div className="text-center p-6 space-y-3">
                                    <div className="w-16 h-16 bg-white/5 rounded-[1.5rem] flex items-center justify-center mx-auto shadow-inner group-hover/upload:scale-110 transition-transform">
                                        <Upload className="text-[var(--text-tertiary)] group-hover/upload:text-white transition-colors" size={28} />
                                    </div>
                                    <p className="text-xs font-black uppercase tracking-widest text-[var(--text-tertiary)] group-hover/upload:text-white transition-colors">Subir Rostro</p>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                onChange={(e) => handleFileUpload(e, setSourceImage)}
                            />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-light)] shadow-2xl relative group"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent)]/5 blur-2xl rounded-full translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-1000" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-[var(--text-tertiary)] flex items-center gap-2">
                            <span className="w-5 h-5 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">2</span>
                            Imagen Destino
                        </h3>
                        <div className="aspect-video rounded-[2rem] border-2 border-dashed border-[var(--border-light)] bg-[var(--bg-input)]/50 hover:border-[var(--accent)]/50 transition-all flex flex-col items-center justify-center relative overflow-hidden group/upload cursor-pointer">
                            {targetMedia ? (
                                <img src={targetMedia} alt="Target" className="w-full h-full object-cover group-hover/upload:scale-105 transition-transform duration-700" />
                            ) : (
                                <div className="text-center p-6 space-y-3">
                                    <div className="w-16 h-16 bg-white/5 rounded-[1.5rem] flex items-center justify-center mx-auto shadow-inner group-hover/upload:scale-110 transition-transform">
                                        <Upload className="text-[var(--text-tertiary)] group-hover/upload:text-white transition-colors" size={28} />
                                    </div>
                                    <p className="text-xs font-black uppercase tracking-widest text-[var(--text-tertiary)] group-hover/upload:text-white transition-colors">Subir Destino</p>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                onChange={(e) => handleFileUpload(e, setTargetMedia)}
                            />
                        </div>
                    </motion.div>
                </div>

                {/* Processing Results */}
                <div className="lg:col-span-8 h-full min-h-[500px] lg:h-[750px] bg-[var(--bg-card)] rounded-[3rem] border border-[var(--border-light)] flex flex-col relative overflow-hidden shadow-2xl group/engine">
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="absolute top-6 left-6 right-6 z-30 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-500 text-[11px] flex items-center gap-3 font-black uppercase tracking-widest shadow-2xl backdrop-blur-xl"
                            >
                                <AlertCircle size={16} /> {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                        {!isProcessing && sourceImage && targetMedia && !resultImage && (
                            <motion.button
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                whileHover={{ scale: 1.05, boxShadow: "0 0 40px var(--primary-glow)" }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleProcess}
                                className="pointer-events-auto bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white px-10 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-[var(--primary-glow)] flex items-center gap-4 text-xs transition-all animate-fade-in"
                            >
                                <RefreshCw size={20} className="animate-spin-slow" />
                                Iniciar Intercambio
                            </motion.button>
                        )}
                    </div>

                    <div className="flex-1 bg-black/40 flex items-center justify-center p-8">
                        {isProcessing ? (
                            <div className="text-center space-y-6">
                                <div className="relative w-24 h-24 mx-auto">
                                    <div className="absolute inset-0 border-4 border-[var(--primary)]/10 rounded-full" />
                                    <div className="absolute inset-0 border-4 border-t-[var(--primary)] border-r-[var(--accent)] rounded-full animate-spin" />
                                    <div className="absolute inset-4 bg-gradient-to-tr from-[var(--primary)]/20 to-[var(--accent)]/20 rounded-full flex items-center justify-center">
                                        <Zap size={24} className="text-white animate-pulse" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-white font-black uppercase tracking-[0.3em] text-xs">Mapeando Estructura Facial</p>
                                    <p className="text-[var(--text-tertiary)] text-[10px] font-bold uppercase tracking-widest mt-2">InsightFace Buffalo_L Engine Active</p>
                                </div>
                            </div>
                        ) : resultImage ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
                                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                                transition={{ duration: 1 }}
                                className="w-full h-full flex items-center justify-center relative"
                            >
                                <img
                                    src={resultImage}
                                    alt="Result"
                                    className="max-w-full max-h-full rounded-2xl shadow-[0_0_100px_-20px_var(--primary-glow)] object-contain border border-white/5"
                                />

                                <div className="absolute bottom-6 right-6 flex gap-4">
                                    <a
                                        href={resultImage}
                                        download="faceswap-result.png"
                                        className="p-4 bg-white/5 hover:bg-white/10 backdrop-blur-xl rounded-2xl text-white transition-all border border-white/10 shadow-2xl active:scale-95 group/dl"
                                    >
                                        <Download size={20} className="group-hover/dl:translate-y-0.5 transition-transform" />
                                    </a>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="text-center opacity-10 select-none group-hover/engine:opacity-20 transition-opacity duration-1000">
                                <Zap size={80} className="mx-auto mb-6 text-white" />
                                <p className="font-black uppercase tracking-[0.4em] text-sm">Waiting for Engine Input</p>
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-[var(--border-light)] bg-white/5 backdrop-blur-xl flex justify-between items-center px-8">
                        <div className="flex items-center gap-3">
                            <ShieldCheck size={16} className="text-emerald-400" />
                            <span className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Neural Match V4.2 - InsightFace Enabled</span>
                        </div>
                        <div className="flex gap-4">
                            {resultImage && (
                                <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest bg-emerald-400/10 px-4 py-2 rounded-xl border border-emerald-400/20">
                                    <Save size={14} />
                                    Asset Sincronizado
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

