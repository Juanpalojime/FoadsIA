
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Zap, Play, ArrowRight, Star, Menu, X, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function Landing() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] overflow-x-hidden selection:bg-[var(--primary)]/30">
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-[var(--primary-glow)] blur-[120px] rounded-full opacity-20" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-[var(--accent-glow)] blur-[120px] rounded-full opacity-10" />
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-[100] border-b border-[var(--border-light)] bg-[var(--bg-main)]/50 backdrop-blur-xl px-4 md:px-12 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--primary)] to-[var(--accent)] text-white flex items-center justify-center font-black text-xl shadow-lg shadow-[var(--primary-glow)]">E</div>
                    <span className="font-black text-2xl tracking-tighter text-white">EnfoadsIA</span>
                </div>

                {/* Desktop Links */}
                <div className="hidden lg:flex gap-10 text-xs font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em]">
                    <a href="#features" className="hover:text-white transition-colors">Características</a>
                    <a href="#creation" className="hover:text-white transition-colors">Studio Hub</a>
                    <a href="#pricing" className="hover:text-white transition-colors">Pro Plan</a>
                </div>

                <div className="flex items-center gap-4">
                    <Link to="/home" className="hidden sm:flex px-8 py-3 bg-white text-black hover:bg-white/90 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95">
                        Iniciar Sesión
                    </Link>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="lg:hidden p-2.5 bg-white/5 border border-white/10 rounded-xl text-white"
                    >
                        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute top-full left-0 w-full bg-[var(--bg-sidebar)] border-b border-[var(--border-light)] p-8 flex flex-col gap-6 lg:hidden shadow-2xl"
                        >
                            <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-sm font-black uppercase tracking-widest">Características</a>
                            <a href="#creation" onClick={() => setIsMenuOpen(false)} className="text-sm font-black uppercase tracking-widest">Studio Hub</a>
                            <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="text-sm font-black uppercase tracking-widest">Pro Plan</a>
                            <Link to="/home" className="w-full py-4 bg-[var(--primary)] text-white text-center rounded-2xl font-black text-xs uppercase tracking-[0.2em]">Entrar a la App</Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-48 pb-24 px-4 flex flex-col items-center justify-center text-center min-h-screen z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-5xl"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.2em] mb-10 shadow-inner">
                        <Sparkles size={12} className="text-[var(--primary)]" />
                        Next-Gen Content Engine
                    </div>

                    <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-8 leading-[0.9] text-white">
                        CREA MAGIA <br />
                        <span className="text-gradient">SIN LÍMITES</span>
                    </h1>

                    <p className="text-lg md:text-xl text-[var(--text-secondary)] mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                        La suite de inteligencia artificial más potente para creadores.
                        Diseña anuncios virales, intercambia rostros y genera fotografía fotorrealista en segundos.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link to="/home" className="px-12 py-5 bg-[var(--grad-primary)] text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] transition-all shadow-[0_20px_40px_var(--primary-glow)] hover:shadow-[0_25px_50px_var(--primary-glow)] transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3">
                            Empezar Ahora <ArrowRight size={20} />
                        </Link>
                        <button className="px-12 py-5 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white border border-white/10 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95">
                            <Play size={18} fill="white" /> Demo Reel
                        </button>
                    </div>
                </motion.div>

                {/* Main Visual */}
                <motion.div
                    initial={{ opacity: 0, y: 100, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 1.2, delay: 0.2 }}
                    className="mt-28 w-full max-w-6xl relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-main)] via-transparent to-transparent z-10 h-full" />
                    <div className="relative p-2 bg-white/5 border border-white/10 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--primary)]/20 to-[var(--accent)]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        <img
                            src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2074&auto=format&fit=crop"
                            alt="Plataforma EnfoadsIA"
                            className="rounded-[2.5rem] w-full h-auto shadow-inner relative z-20 grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000"
                        />
                    </div>
                </motion.div>
            </section>

            {/* Features Stats */}
            <section id="features" className="py-32 px-4 relative z-10">
                <div className="max-w-7xl mx-auto space-y-32">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={Sparkles}
                            title="Gen-3 Engine"
                            desc="Motor avanzado basado en SDXL Lightning para resultados cinemáticos en tiempo récord."
                        />
                        <FeatureCard
                            icon={Zap}
                            title="Instant Render"
                            desc="Nuestra infraestructura en la nube garantiza renderizados de video y cara en tiempo real."
                        />
                        <FeatureCard
                            icon={Star}
                            title="Brand Flow"
                            desc="Integración inteligente de tus logos y guías de estilo mediante análisis visual neuronal."
                        />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 py-20 bg-white/5 border border-white/10 rounded-[4rem] backdrop-blur-xl">
                        <StatBox count="4s" label="Render" />
                        <StatBox count="8K" label="Output" />
                        <StatBox count="100+" label="Models" />
                        <StatBox count="24/7" label="Uptime" />
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-40 px-4 text-center relative z-10 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[var(--primary)]/5 blur-[150px] opacity-30 rounded-full" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="max-w-4xl mx-auto relative p-12 lg:p-24 bg-white/5 border border-white/10 rounded-[4rem] shadow-2xl backdrop-blur-3xl overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 transition-transform duration-1000 group-hover:rotate-0">
                        <Sparkles size={200} className="text-white" />
                    </div>

                    <h2 className="text-4xl md:text-6xl font-black mb-8 text-white tracking-tighter">EL FUTURO <br /> ES AHORA</h2>
                    <p className="text-lg md:text-xl text-[var(--text-secondary)] mb-12 max-w-xl mx-auto font-medium leading-relaxed">
                        Únete a los creadores que ya están redefiniendo el marketing visual con el poder de la IA.
                    </p>

                    <Link to="/home" className="px-14 py-6 bg-white text-black rounded-[2rem] font-black text-sm uppercase tracking-[0.25em] shadow-2xl transform hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-4">
                        Empezar Ahora <ArrowRight size={20} />
                    </Link>

                    <div className="mt-16 flex justify-center gap-8 opacity-40">
                        <div className="flex items-center gap-2"><CheckCircle2 size={14} /> No card required</div>
                        <div className="flex items-center gap-2"><CheckCircle2 size={14} /> Full Access</div>
                    </div>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="py-20 border-t border-white/5 px-4 text-center relative z-10">
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center font-black text-lg">E</div>
                    <span className="font-black text-xl tracking-tighter text-white">EnfoadsIA</span>
                </div>
                <div className="flex justify-center gap-8 mb-12 text-xs font-black uppercase tracking-widest text-[var(--text-tertiary)]">
                    <a href="#" className="hover:text-white">Twitter</a>
                    <a href="#" className="hover:text-white">Discord</a>
                    <a href="#" className="hover:text-white">Instagram</a>
                </div>
                <p className="text-[var(--text-tertiary)] text-[10px] font-bold uppercase tracking-[0.2em]">
                    © 2025 ENFOADSIA ENGINE. ALL RIGHTS RESERVED.
                </p>
            </footer>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <motion.div
            whileHover={{ y: -10 }}
            className="p-10 rounded-[3rem] bg-white/5 border border-white/10 hover:border-white/20 transition-all flex flex-col items-center text-center gap-6 group hover:bg-white/10 shadow-xl"
        >
            <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-tr from-[var(--primary)]/20 to-[var(--accent)]/20 text-white flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                <Icon size={28} className="text-white drop-shadow-[0_0_10px_var(--primary-glow)]" />
            </div>
            <div>
                <h3 className="text-xl font-black text-white mb-3 uppercase tracking-wider">{title}</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed text-sm font-medium">{desc}</p>
            </div>
        </motion.div>
    );
}

function StatBox({ count, label }: { count: string, label: string }) {
    return (
        <div className="text-center group">
            <div className="text-5xl font-black text-white mb-2 tracking-tighter group-hover:scale-110 transition-transform cursor-default">{count}</div>
            <div className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.3em]">{label}</div>
        </div>
    );
}

