import React, { useState, useCallback, useMemo } from 'react';
import { WizardStep, BrandImage } from '../types';
import { Upload, CheckCircle2, Sliders, Trash2, ArrowRight, ArrowLeft, Check, Plus, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

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
        <div className="min-h-[calc(100vh-12rem)] flex flex-col gap-8 pb-12">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black mb-1">Brand Vault</h1>
                    <p className="text-muted-foreground">Gestiona tus activos de marca y guías de estilo con IA.</p>
                </div>

                {/* Steps Horizontal */}
                <div className="flex items-center gap-4 bg-muted/20 border border-border p-2 rounded-2xl shadow-sm">
                    {[
                        { step: WizardStep.UPLOAD, icon: Upload, label: 'Cargar' },
                        { step: WizardStep.CONFIG, icon: Sliders, label: 'Ajustar' },
                        { step: WizardStep.REVIEW, icon: CheckCircle2, label: 'Review' },
                    ].map((s) => (
                        <div key={s.step} className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300",
                            currentStep === s.step ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground"
                        )}>
                            <s.icon size={14} className={cn(currentStep === s.step ? "text-primary-foreground" : "opacity-40")} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <Card className="rounded-[2.5rem] flex flex-col overflow-hidden shadow-xl min-h-[500px] border-border bg-card">
                <header className="p-6 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <ImageIcon size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-sm text-foreground">Repositorio de Activos</h2>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{selectedCount} Seleccionados</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        {currentStep > 1 && (
                            <Button variant="ghost" onClick={prevStep} className="px-6 h-12 text-xs font-black uppercase tracking-widest gap-2">
                                <ArrowLeft size={16} /> Atrás
                            </Button>
                        )}
                        <Button
                            onClick={nextStep}
                            disabled={selectedCount === 0}
                            className="px-8 h-12 rounded-[1.25rem] text-xs font-black uppercase tracking-[0.15em] shadow-lg gap-3"
                        >
                            {currentStep === 3 ? 'Finalizar Configuración' : 'Siguiente Paso'}
                            <ArrowRight size={16} />
                        </Button>
                    </div>
                </header>

                <ScrollArea className="flex-1">
                    <div className="p-6 lg:p-12 max-w-6xl mx-auto w-full">
                        <AnimatePresence mode="wait">
                            {currentStep === WizardStep.UPLOAD && (
                                <motion.div
                                    key="upload"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="space-y-12"
                                >
                                    {/* Dropzone */}
                                    <div className="group relative">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
                                        <div className="relative border-2 border-dashed border-border rounded-[2.5rem] p-16 flex flex-col items-center justify-center gap-6 bg-muted/10 hover:border-primary/50 transition-all cursor-pointer">
                                            <input type="file" multiple onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary shadow-inner">
                                                <Plus size={36} className="group-hover:rotate-90 transition-transform duration-500" />
                                            </div>
                                            <div className="text-center">
                                                <h3 className="font-black text-xl mb-1 text-foreground">Cargar Nuevos Recursos</h3>
                                                <p className="text-sm text-muted-foreground font-medium">Arrastra tus archivos o haz clic para explorar</p>
                                            </div>
                                            <div className="flex gap-4 opacity-50">
                                                {['PNG', 'JPG', 'WEBP'].map(ext => (
                                                    <Badge key={ext} variant="secondary" className="px-2 py-1 text-[10px] font-bold border-border">{ext}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Grid */}
                                    <div className="space-y-6">
                                        <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] px-2">Archivos Disponibles</h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                            {images.map((img) => (
                                                <motion.div
                                                    key={img.id}
                                                    layout
                                                    className={cn(
                                                        "aspect-square rounded-[2rem] overflow-hidden relative group border-2 cursor-pointer transition-all duration-300 bg-muted/20",
                                                        img.selected ? "border-primary shadow-lg shadow-primary/20 scale-[0.98]" : "border-transparent"
                                                    )}
                                                    onClick={() => handleToggleSelect(img.id)}
                                                >
                                                    <img src={img.url} alt={img.alt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                                    <div className={cn(
                                                        "absolute top-4 right-4 w-7 h-7 rounded-xl flex items-center justify-center transition-all shadow-lg",
                                                        img.selected ? "bg-primary text-white scale-110" : "bg-black/40 text-white backdrop-blur-md opacity-0 group-hover:opacity-100"
                                                    )}>
                                                        <Check size={16} strokeWidth={3} />
                                                    </div>

                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteImage(img.id); }}
                                                        className="absolute bottom-4 right-4 h-8 w-8 rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {currentStep === WizardStep.CONFIG && (
                                <motion.div key="config" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-24 text-center">
                                    <div className="w-24 h-24 bg-gradient-to-tr from-primary to-purple-600 rounded-[2.5rem] flex items-center justify-center text-white mb-8 shadow-2xl animate-pulse">
                                        <Sliders size={40} />
                                    </div>
                                    <h2 className="text-4xl font-black mb-4 tracking-tight text-foreground">IA Brand Analysis</h2>
                                    <p className="text-muted-foreground max-w-md text-lg leading-relaxed font-medium">Gemini está analizando la composición, paletas de colores y sujetos de tus assets seleccionados para crear una guía de estilo coherente.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </ScrollArea>
            </Card>
        </div>
    );
}
