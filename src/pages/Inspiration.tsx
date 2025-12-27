import { useEffect, useState } from 'react';
import { Compass, Sparkles, Heart, Share2, Eye, Play, X, Filter, Film, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../services/db';
import type { Asset } from '../services/db';
import clsx from 'clsx';
import '../styles/variables.css';

const industries = ['Todas', 'E-commerce', 'Tecnología', 'Moda', 'Educación', 'Inmuebles'];
const platforms = ['Todas', 'TikTok/Reels', 'YouTube', 'Ads', 'Cine'];
const styles = ['Todas', 'Cinematográfico', 'Minimalista', 'Vibrante', 'Vintage'];

export default function Inspiration() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
    const [selectedIndustry, setSelectedIndustry] = useState('Todas');
    const [selectedPlatform, setSelectedPlatform] = useState('Todas');
    const [selectedStyle, setSelectedStyle] = useState('Todas');
    const [likedItems, setLikedItems] = useState<Set<number>>(new Set());
    const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);

    useEffect(() => {
        const loadAssets = async () => {
            const all = await db.getAllAssets();
            setAssets(all);
            setLoading(false);
        };
        loadAssets();
    }, []);

    const toggleLike = (id: number) => {
        setLikedItems(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const filteredAssets = assets.filter(a => {
        const typeMatch = filter === 'all' || a.type === filter;
        // Mocking industry/platform/style since they aren't in DB yet
        return typeMatch;
    });

    return (
        <div className="max-w-7xl mx-auto h-full flex flex-col gap-8">
            <header className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black flex items-center gap-3 tracking-tight">
                            <Compass className="text-[var(--primary)]" size={32} />
                            Hub de Inspiración <span className="text-[var(--primary)] text-xs px-2 py-0.5 bg-[var(--primary)]/10 rounded-full ml-2">PREMIUM</span>
                        </h1>
                        <p className="text-[var(--text-secondary)] mt-1">Directorio de activos IA de alto impacto visual.</p>
                    </div>

                    <div className="flex bg-[var(--bg-card)] p-1 rounded-xl border border-[var(--border-light)] shadow-sm">
                        {['all', 'image', 'video'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as any)}
                                className={clsx(
                                    "px-4 py-2 rounded-lg text-xs font-black transition-all uppercase tracking-widest",
                                    filter === f ? "bg-[var(--primary)] text-white shadow-lg" : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                                )}
                            >
                                {f === 'all' ? 'Todas' : f === 'image' ? 'Imágenes' : 'Videos'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ADVANCED FILTER BAR */}
                <div className="flex flex-wrap items-center gap-4 bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-light)] shadow-inner">
                    <div className="flex items-center gap-2 text-[var(--text-tertiary)] mr-2">
                        <Filter size={16} />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Filtros Pro:</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <select
                            value={selectedIndustry}
                            onChange={(e) => setSelectedIndustry(e.target.value)}
                            className="bg-[var(--bg-input)] border border-[var(--border-light)] text-[10px] font-bold px-3 py-1.5 rounded-lg outline-none focus:border-[var(--primary)] transition-all uppercase"
                        >
                            {industries.map(i => <option key={i} value={i}>{i}</option>)}
                        </select>

                        <select
                            value={selectedPlatform}
                            onChange={(e) => setSelectedPlatform(e.target.value)}
                            className="bg-[var(--bg-input)] border border-[var(--border-light)] text-[10px] font-bold px-3 py-1.5 rounded-lg outline-none focus:border-[var(--primary)] transition-all uppercase"
                        >
                            {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>

                        <select
                            value={selectedStyle}
                            onChange={(e) => setSelectedStyle(e.target.value)}
                            className="bg-[var(--bg-input)] border border-[var(--border-light)] text-[10px] font-bold px-3 py-1.5 rounded-lg outline-none focus:border-[var(--primary)] transition-all uppercase"
                        >
                            {styles.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : filteredAssets.length === 0 ? (
                <div className="flex-1 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-3xl flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-20 h-20 bg-[var(--bg-input)] rounded-full flex items-center justify-center mb-6">
                        <Sparkles size={40} className="text-[var(--primary)] opacity-20" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Sin contenido en esta categoría</h2>
                    <p className="text-[var(--text-secondary)] max-w-sm">Genera tu primera creación para verla aquí.</p>
                </div>
            ) : (
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 pb-12">
                    {filteredAssets?.map((asset, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.05 }}
                            key={asset.id}
                            onClick={() => setPreviewAsset(asset)}
                            className="break-inside-avoid bg-[var(--bg-card)] border border-[var(--border-light)] rounded-3xl overflow-hidden group cursor-pointer hover:border-[var(--primary)] transition-all shadow-xl relative active:scale-[0.98]"
                        >
                            <div className="relative overflow-hidden aspect-auto">
                                <img
                                    src={asset.content}
                                    alt={asset.prompt}
                                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 md:opacity-0 transition-opacity flex items-center justify-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform">
                                        {asset.type === 'video' ? <Play fill="currentColor" size={24} /> : <Eye size={24} />}
                                    </div>
                                </div>
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <span className="bg-black/40 backdrop-blur-md text-white text-[9px] font-black px-2 py-1 rounded-full border border-white/10 uppercase tracking-widest">
                                        {asset.type === 'video' ? <Film size={10} className="inline mr-1" /> : <Zap size={10} className="inline mr-1" />}
                                        {asset.type}
                                    </span>
                                </div>
                            </div>
                            <div className="p-5 bg-gradient-to-b from-transparent to-[var(--bg-main)]/30">
                                <p className="text-xs text-[var(--text-secondary)] line-clamp-2 italic font-medium leading-relaxed">"{asset.prompt}"</p>
                                <div className="flex items-center justify-between mt-5 border-t border-[var(--border-light)] pt-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[var(--primary)] to-indigo-500"></div>
                                        <span className="text-[9px] font-black text-[var(--text-tertiary)] uppercase tracking-tighter">Foads_Creator</span>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleLike(asset.id!); }}
                                        className={clsx(
                                            "flex items-center gap-1.5 transition-all",
                                            likedItems.has(asset.id!) ? "text-red-500" : "text-[var(--text-tertiary)] hover:text-red-500"
                                        )}
                                    >
                                        <Heart size={14} fill={likedItems.has(asset.id!) ? "currentColor" : "none"} />
                                        <span className="text-[10px] font-bold">{likedItems.has(asset.id!) ? 501 : 500}</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* PREVIEW MODAL */}
            <AnimatePresence>
                {previewAsset && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
                        onClick={() => setPreviewAsset(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-[var(--bg-card)] border border-[var(--border-light)] rounded-[2.5rem] overflow-hidden max-w-5xl w-full max-h-[90vh] flex flex-col md:flex-row relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setPreviewAsset(null)}
                                className="absolute top-4 right-4 z-50 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all"
                            >
                                <X size={24} />
                            </button>

                            <div className="md:flex-[3] bg-black flex items-center justify-center relative group min-h-[400px]">
                                {previewAsset.type === 'video' ? (
                                    <video
                                        src={previewAsset.content}
                                        controls
                                        autoPlay
                                        className="w-full h-full max-h-[80vh] object-contain"
                                    />
                                ) : (
                                    <img
                                        src={previewAsset.content}
                                        className="w-full h-full max-h-[80vh] object-contain"
                                        alt="Preview"
                                    />
                                )}
                            </div>

                            <div className="md:flex-[2] p-8 flex flex-col h-full bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-main)]">
                                <div className="flex items-center gap-2 mb-6">
                                    <span className="px-3 py-1 bg-[var(--primary)] text-white text-[10px] font-black rounded-full uppercase tracking-widest">
                                        {previewAsset.type}
                                    </span>
                                    <span className="px-3 py-1 bg-[var(--bg-input)] text-[var(--text-tertiary)] text-[10px] font-black rounded-full uppercase tracking-widest border border-[var(--border-light)]">
                                        4K Neural
                                    </span>
                                </div>

                                <h2 className="text-xl font-black mb-4 tracking-tight leading-tight">Prompt Original</h2>
                                <div className="bg-[var(--bg-input)] p-4 rounded-2xl border border-[var(--border-light)] shadow-inner mb-6 flex-1">
                                    <p className="text-sm text-[var(--text-secondary)] italic leading-relaxed">
                                        "{previewAsset.prompt}"
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--primary)] to-indigo-500"></div>
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-tight">Foads_Studio</p>
                                                <p className="text-[10px] text-[var(--text-tertiary)]">Garantía de Calidad IA</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => toggleLike(previewAsset.id!)}
                                            className={clsx(
                                                "p-3 rounded-2xl border transition-all flex items-center gap-2",
                                                likedItems.has(previewAsset.id!) ? "bg-red-500 border-red-500 text-white" : "border-[var(--border-light)] hover:border-[var(--primary)] text-[var(--text-tertiary)] hover:text-[var(--primary)]"
                                            )}
                                        >
                                            <Heart size={20} fill={likedItems.has(previewAsset.id!) ? "currentColor" : "none"} />
                                            <span className="text-xs font-black">{likedItems.has(previewAsset.id!) ? '501' : '500'}</span>
                                        </button>
                                    </div>

                                    <button className="w-full py-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-3 active:scale-95">
                                        <Share2 size={18} /> Copiar Prompt & Remix
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
