import { useNavigate } from 'react-router-dom';
import { Video, Image as ImageIcon, Zap, Clapperboard, Layers, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
    {
        title: 'Creative Studio',
        description: 'Generación automática de anuncios con IA inteligente y mockups.',
        icon: Sparkles,
        path: '/ad-creator',
        color: '#8b5cf6',
        delay: 0.1,
        badge: 'Nuevo'
    },
    {
        title: 'Video Comercial',
        description: 'Producción de anuncios premium con avatares y subtítulos.',
        icon: Clapperboard,
        path: '/commercial-video',
        color: '#ec4899',
        delay: 0.2
    },
    {
        title: 'Canvas Editor',
        description: 'Edición por capas con generación de áreas por IA asistida.',
        icon: Layers,
        path: '/canvas-editor',
        color: '#3b82f6',
        delay: 0.3
    },
    {
        title: 'Generación Fotográfica',
        description: 'Crea fotografía de producto hyper-realista con SDXL.',
        icon: ImageIcon,
        path: '/generate-images',
        color: '#10b981',
        delay: 0.4
    },
    {
        title: 'Face Swap Lab',
        description: 'Intercambio de rostros profesional para contenido viral.',
        icon: Zap,
        path: '/face-swap',
        color: '#f59e0b',
        delay: 0.5
    },
    {
        title: 'Avatar Studio',
        description: 'Crea portavoces digitales que hablan cualquier idioma.',
        icon: Video,
        path: '/generate-videos',
        color: '#6366f1',
        delay: 0.6
    }
];

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="space-y-12 pb-12">
            {/* Hero Section */}
            <div className="relative p-8 lg:p-12 rounded-[2.5rem] bg-gradient-to-br from-[var(--bg-card)] to-transparent border border-[var(--border-light)] overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[var(--primary)]/5 to-transparent pointer-events-none" />
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--primary)]/10 blur-[80px] rounded-full" />

                <div className="relative z-10 max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] text-xs font-bold uppercase tracking-wider mb-6"
                    >
                        <Sparkles size={12} />
                        Bienvenido a la Nueva Era de Creación
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl lg:text-6xl font-black mb-6 leading-[1.1]"
                    >
                        Crea Contenido <br />
                        <span className="text-gradient">Viral con IA</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-[var(--text-secondary)] mb-10 leading-relaxed"
                    >
                        Potencia tu marca con herramientas de inteligencia artificial de última generación.
                        Desde videos comerciales hasta fotografía de producto profesional.
                    </motion.p>

                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        onClick={() => navigate('/ad-creator')}
                        className="premium-button text-base px-8 py-4 group"
                    >
                        Empezar a Crear
                        <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                    </motion.button>
                </div>
            </div>

            {/* Grid Tools */}
            <div className="space-y-6">
                <div className="flex items-end justify-between px-2">
                    <div>
                        <h2 className="text-2xl font-black">Herramientas Pro</h2>
                        <p className="text-[var(--text-secondary)]">Explora nuestras soluciones creativas</p>
                    </div>
                    <button className="text-sm font-bold text-[var(--primary)] hover:underline">Ver todas</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: feature.delay }}
                            whileHover={{ y: -5 }}
                            className="p-8 rounded-[2rem] bg-[var(--bg-card)] border border-[var(--border-light)] cursor-pointer group hover:border-[var(--primary)]/30 transition-all relative overflow-hidden flex flex-col h-full"
                            onClick={() => navigate(feature.path)}
                        >
                            {/* Accent Glow */}
                            <div
                                className="absolute top-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-10 rounded-full blur-3xl transition-opacity duration-500"
                                style={{ backgroundColor: feature.color }}
                            />

                            {feature.badge && (
                                <span className="absolute top-4 right-4 px-2 py-1 bg-[var(--primary)] text-white text-[10px] font-black uppercase rounded-lg shadow-lg">
                                    {feature.badge}
                                </span>
                            )}

                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg"
                                style={{ backgroundColor: `${feature.color}15`, color: feature.color, border: `1px solid ${feature.color}30` }}
                            >
                                <feature.icon size={30} />
                            </div>

                            <h3 className="text-xl font-bold mb-3 text-white group-hover:text-[var(--primary)] transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6 flex-1">
                                {feature.description}
                            </p>

                            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-tertiary)] group-hover:text-[var(--primary)] transition-colors">
                                EXPLORAR <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
