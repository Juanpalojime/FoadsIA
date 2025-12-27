import { useState } from 'react';
import { Upload, ArrowRight, Save, Image as ImageIcon, Video as VideoIcon, RefreshCw, Download, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
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
                // Save to DB automatically
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
        <div className="max-w-6xl mx-auto h-full flex flex-col">
            <header className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Face Swap Lab</h1>
                    <p className="text-[var(--text-secondary)]">Intercambia rostros en imágenes utilizando InsightFace.</p>
                </div>

                <div className="flex bg-[var(--bg-card)] p-1 rounded-lg border border-[var(--border-light)]">
                    <button
                        onClick={() => { setMediaType('image'); setTargetMedia(null); setResultImage(null); }}
                        className={clsx(
                            "px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-all",
                            mediaType === 'image' ? "bg-[var(--bg-hover)] text-white shadow-sm" : "text-[var(--text-secondary)] hover:text-white"
                        )}
                    >
                        <ImageIcon size={16} />
                        Imagen
                    </button>
                    <button
                        disabled
                        className="px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium opacity-50 cursor-not-allowed text-[var(--text-tertiary)]"
                    >
                        <VideoIcon size={16} />
                        Video (Próximamente)
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-light)]"
                    >
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-[var(--primary)] text-xs flex items-center justify-center">1</span>
                            Cara Origen (Source)
                        </h3>
                        <div className="aspect-square rounded-xl border-2 border-dashed border-[var(--border-light)] bg-[var(--bg-input)] hover:border-[var(--primary)] transition-colors flex flex-col items-center justify-center relative overflow-hidden group">
                            {sourceImage ? (
                                <img src={sourceImage} alt="Source" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center p-4">
                                    <Upload className="mx-auto mb-2 text-[var(--text-tertiary)]" size={32} />
                                    <p className="text-sm text-[var(--text-secondary)]">Sube la foto del rostro</p>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => handleFileUpload(e, setSourceImage)}
                            />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-light)]"
                    >
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-[var(--primary)] text-xs flex items-center justify-center">2</span>
                            Imagen Destino (Target)
                        </h3>
                        <div className="aspect-video rounded-xl border-2 border-dashed border-[var(--border-light)] bg-[var(--bg-input)] hover:border-[var(--primary)] transition-colors flex flex-col items-center justify-center relative overflow-hidden group">
                            {targetMedia ? (
                                <img src={targetMedia} alt="Target" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center p-4">
                                    <Upload className="mx-auto mb-2 text-[var(--text-tertiary)]" size={32} />
                                    <p className="text-sm text-[var(--text-secondary)]">Sube la imagen a modificar</p>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => handleFileUpload(e, setTargetMedia)}
                            />
                        </div>
                    </motion.div>
                </div>

                <div className="flex flex-col h-full">
                    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-light)] flex-1 flex flex-col relative overflow-hidden">

                        {error && (
                            <div className="absolute top-4 left-4 right-4 z-20 bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-500 text-xs flex items-center gap-2 font-bold shadow-lg">
                                <AlertCircle size={14} /> {error}
                            </div>
                        )}

                        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                            {!isProcessing && sourceImage && targetMedia && !resultImage && (
                                <motion.button
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleProcess}
                                    className="pointer-events-auto bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-8 py-4 rounded-full font-bold shadow-[var(--shadow-glow)] flex items-center gap-3 text-lg transition-all"
                                >
                                    <RefreshCw size={24} />
                                    Generar Face Swap
                                </motion.button>
                            )}
                        </div>

                        <div className="flex-1 bg-[var(--bg-main)] flex items-center justify-center p-8">
                            {isProcessing ? (
                                <div className="text-center">
                                    <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-[var(--text-primary)] font-medium">Procesando con InsightFace...</p>
                                    <p className="text-[var(--text-secondary)] text-sm">Esto puede tomar unos segundos.</p>
                                </div>
                            ) : resultImage ? (
                                <motion.img
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    src={resultImage}
                                    alt="Result"
                                    className="max-w-full max-h-full rounded-lg shadow-2xl object-contain border border-[var(--border-light)]"
                                />
                            ) : (
                                <div className="text-center opacity-30">
                                    <ArrowRight size={48} className="mx-auto mb-2" />
                                    <p>El resultado aparecerá aquí</p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-[var(--border-light)] bg-[var(--bg-card)] flex justify-between items-center">
                            <span className="text-xs text-[var(--text-tertiary)]">InsightFace Buffalo_L</span>
                            <div className="flex gap-2">
                                {resultImage && (
                                    <>
                                        <a
                                            href={resultImage}
                                            download="faceswap-result.png"
                                            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-white px-3 py-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
                                        >
                                            <Download size={18} />
                                            Descargar
                                        </a>
                                        <div className="flex items-center gap-2 text-green-500 px-3 py-1.5">
                                            <Save size={18} />
                                            Guardado
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
