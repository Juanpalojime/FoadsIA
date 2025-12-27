import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Zap, Play, ArrowRight, Star } from 'lucide-react';
import '../styles/variables.css';

export default function Landing() {
    return (
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] overflow-x-hidden">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 glass-panel border-b border-[var(--border-light)] py-4 px-8 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center font-bold text-lg">E</div>
                    <span className="font-bold text-2xl tracking-tight">EnfoadsIA</span>
                </div>
                <div className="hidden md:flex gap-8 text-sm font-medium text-[var(--text-secondary)]">
                    <a href="#features" className="hover:text-[var(--primary)] transition-colors">Características</a>
                    <a href="#creation" className="hover:text-[var(--primary)] transition-colors">Creación</a>
                    <a href="#pricing" className="hover:text-[var(--primary)] transition-colors">Precios</a>
                </div>
                <Link to="/home" className="px-6 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-full font-bold transition-all shadow-[var(--shadow-glow)]">
                    Entrar a la App
                </Link>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-8 flex flex-col items-center justify-center text-center min-h-[90vh]">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)] opacity-10 blur-[120px] rounded-full animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600 opacity-10 blur-[120px] rounded-full animate-pulse delay-700"></div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="z-10 max-w-4xl"
                >
                    <span className="px-4 py-1.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-bold border border-[var(--primary)]/20 mb-6 inline-block">
                        Propulsado por Juggernaut XL v9 & SDXL Lightning
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
                        Crea Contenido <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-purple-400">Visual Épico</span> en Segundos
                    </h1>
                    <p className="text-xl text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto leading-relaxed">
                        La plataforma definitiva para creadores. Generación de imágenes fotorrealistas, face swap profesional y video comercial IA, todo en un solo lugar.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/home" className="px-8 py-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-xl font-bold text-lg transition-all shadow-[var(--shadow-glow)] flex items-center justify-center gap-2 group">
                            Empezar Ahora <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <button className="px-8 py-4 glass-panel hover:bg-[var(--bg-hover)] text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2">
                            <Play size={20} fill="currentColor" /> Ver Demo
                        </button>
                    </div>
                </motion.div>

                {/* Hero Image Mockup */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mt-20 z-10 w-full max-w-6xl glass-panel rounded-2xl p-4 shadow-2xl border border-[var(--border-light)] relative group"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-[var(--primary)] to-purple-600 rounded-2xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity"></div>
                    <img
                        src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2074&auto=format&fit=crop"
                        alt="Plataforma EnfoadsIA"
                        className="rounded-xl w-full h-auto shadow-inner relative z-10"
                    />
                </motion.div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 px-8 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">Potencial Ilimitado</h2>
                    <p className="text-[var(--text-secondary)]">Herramientas diseñadas para la excelencia visual.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<Sparkles size={24} />}
                        title="Generación Pro"
                        desc="Imágenes de ultra-alta definición en menos de 5 segundos con SDXL Lightning."
                    />
                    <FeatureCard
                        icon={<Zap size={24} />}
                        title="Face Swap Lab"
                        desc="Intercambio de rostros profesional para cine y publicidad con precisión milimétrica."
                    />
                    <FeatureCard
                        icon={<Play size={24} />}
                        title="Video Marketing"
                        desc="Convierte tus guiones en videos con avatares fotorrealistas de forma automática."
                    />
                </div>
            </section>

            {/* Stats */}
            <section className="py-20 bg-[var(--bg-card)] border-y border-[var(--border-light)] overflow-hidden">
                <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <StatBox count="4.0s" label="Tiempo Generación" />
                    <StatBox count="8K" label="Resolución Máxima" />
                    <StatBox count="99%" label="Precisión FaceSwap" />
                    <StatBox count="24/7" label="Disponibilidad" />
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-24 px-8 text-center">
                <div className="max-w-3xl mx-auto glass-panel p-12 rounded-3xl border border-[var(--primary)]/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20"><Star size={64} className="text-[var(--primary)]" /></div>
                    <h2 className="text-4xl font-bold mb-6">¿Listo para crear magia?</h2>
                    <p className="text-[var(--text-secondary)] mb-10 text-lg">Únete a cientos de creadores que ya están definiendo el futuro del contenido visual.</p>
                    <Link to="/home" className="px-10 py-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-xl font-bold text-lg transition-all shadow-[var(--shadow-glow)] inline-flex items-center gap-2">
                        Comenzar Gratis <ArrowRight size={20} />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-[var(--border-light)] px-8 text-center text-[var(--text-tertiary)] text-sm">
                <p>© 2025 EnfoadsIA. Todos los derechos reservados. Desarrollado con 💜 para creadores.</p>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <motion.div
            whileHover={{ y: -10 }}
            className="p-8 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-light)] hover:border-[var(--primary)]/50 transition-all flex flex-col items-start gap-4"
        >
            <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
                {icon}
            </div>
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">{desc}</p>
        </motion.div>
    );
}

function StatBox({ count, label }: { count: string, label: string }) {
    return (
        <div>
            <div className="text-4xl font-bold text-white mb-2">{count}</div>
            <div className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-widest">{label}</div>
        </div>
    );
}
