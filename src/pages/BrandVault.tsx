
import React, { useState, useCallback, useMemo } from 'react';
import { WizardStep, BrandImage } from '../types';
import { Upload, CheckCircle2, Sliders, Layout, Trash2, ArrowRight, ArrowLeft, Check, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const INITIAL_IMAGES: BrandImage[] = [
    { id: '1', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', alt: 'Zapatilla Roja', selected: true },
    { id: '2', url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400', alt: 'Nike Edición Especial', selected: true },
    { id: '3', url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400', alt: 'Vans Classic', selected: false },
];

export default function BrandVault() {
    const [currentStep, setCurrentStep] = useState<WizardStep>(WizardStep.UPLOAD);
    const [images, setImages] = useState<BrandImage[]>(INITIAL_IMAGES);

    const selectedCount = useMemo(() => images.filter(img => img.selected).length, [images]);

    const handleToggleSelect = useCallback((id: string) => {
        setImages(prev => prev.map(img => img.id === id ? { ...img, selected: !img.selected } : img));
    }, []);

    const handleDeleteImage = useCallback((id: string) => {
        setImages(prev => prev.filter(img => img.id !== id));
    }, []);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        const newImages: BrandImage[] = Array.from(files).map((file, idx) => ({
            id: `new-${Date.now()}-${idx}`,
            url: URL.createObjectURL(file),
            alt: file.name,
            selected: true,
        }));
        setImages(prev => [...prev, ...newImages]);
    };

    const nextStep = () => { if (currentStep < 3) setCurrentStep((currentStep + 1) as WizardStep); };
    const prevStep = () => { if (currentStep > 1) setCurrentStep((currentStep - 1) as WizardStep); };

    return (
        <div className="h-[calc(100vh-6rem)] bg-[var(--bg-card)] border border-[var(--border-light)] rounded-xl flex flex-col overflow-hidden shadow-2xl">
            {/* Header Wizard */}
            <header className="p-6 border-b border-[var(--border-light)] flex items-center justify-between bg-[var(--bg-main)]/30">
                <div className="flex items-center gap-12">
                    {[
                        { step: WizardStep.UPLOAD, icon: Upload, label: 'Subir Assets' },
                        { step: WizardStep.CONFIG, icon: Sliders, label: 'Configurar' },
                        { step: WizardStep.REVIEW, icon: CheckCircle2, label: 'Revisar' },
                    ].map((s) => (
                        <div key={s.step} className={clsx(
                            "flex items-center gap-3 transition-colors",
                            currentStep === s.step ? "text-[var(--primary)]" : currentStep > s.step ? "text-[var(--success)]" : "text-[var(--text-tertiary)]"
                        )}>
                            <div className={clsx(
                                "w-8 h-8 rounded-full flex items-center justify-center border-2",
                                currentStep === s.step ? "border-[var(--primary)] shadow-[var(--shadow-glow)]" : currentStep > s.step ? "border-[var(--success)] bg-[var(--success)]/10" : "border-[var(--border-light)]"
                            )}>
                                {currentStep > s.step ? <Check size={16} /> : <s.icon size={16} />}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
                        </div>
                    ))}
                </div>
                <div className="flex gap-3">
                    {currentStep > 1 && (
                        <button onClick={prevStep} className="px-4 py-2 flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)] hover:text-white transition-colors">
                            <ArrowLeft size={16} /> Volver
                        </button>
                    )}
                    <button
                        onClick={nextStep}
                        disabled={selectedCount === 0}
                        className="px-6 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg text-xs font-black uppercase tracking-widest shadow-[var(--shadow-glow)] transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {currentStep === 3 ? 'Finalizar' : 'Siguiente'}
                        <ArrowRight size={16} />
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-5xl mx-auto w-full">
                    <AnimatePresence mode="wait">
                        {currentStep === WizardStep.UPLOAD && (
                            <motion.div
                                key="upload"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="border-4 border-dashed border-[var(--border-light)] rounded-3xl p-12 flex flex-col items-center justify-center gap-4 bg-[var(--bg-main)]/20 hover:border-[var(--primary)]/50 transition-colors relative cursor-pointer">
                                    <input type="file" multiple onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center text-[var(--primary)]">
                                        <Plus size={32} />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="font-bold text-lg">Suelta tus imágenes aquí</h3>
                                        <p className="text-sm text-[var(--text-secondary)]">PNG, JPG o WEBP hasta 10MB c/u</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {images.map((img) => (
                                        <div key={img.id} className={clsx(
                                            "aspect-square rounded-2xl overflow-hidden relative group border-2 cursor-pointer transition-all",
                                            img.selected ? "border-[var(--primary)]" : "border-transparent"
                                        )} onClick={() => handleToggleSelect(img.id)}>
                                            <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                                            <div className={clsx(
                                                "absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-all",
                                                img.selected ? "bg-[var(--primary)] text-white" : "bg-black/50 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100"
                                            )}>
                                                <Check size={14} />
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteImage(img.id); }}
                                                className="absolute bottom-3 right-3 p-2 bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {currentStep === WizardStep.CONFIG && (
                            <motion.div key="config" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col items-center py-20 text-center">
                                <Layout size={64} className="text-[var(--primary)] mb-6 opacity-20" />
                                <h2 className="text-3xl font-black mb-4">Configura tu Brand Vault</h2>
                                <p className="text-[var(--text-secondary)] max-w-md">Gemini está analizando los assets seleccionados para generar paletas de colores y estilos automáticos.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
