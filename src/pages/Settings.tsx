
import { useState, useEffect } from 'react';
import { Save, Server, CheckCircle2, AlertCircle, Sparkles, Key } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Settings() {
    const [apiUrl, setApiUrl] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    useEffect(() => {
        const savedUrl = localStorage.getItem('FOADS_API_URL');
        if (savedUrl) setApiUrl(savedUrl);
    }, []);

    const handleSave = async () => {
        let cleanUrl = apiUrl.trim();
        if (cleanUrl.endsWith('/')) cleanUrl = cleanUrl.slice(0, -1);
        localStorage.setItem('FOADS_API_URL', cleanUrl);

        try {
            setStatus('idle');
            const response = await fetch(`${cleanUrl}/`);
            const data = await response.json();
            if (data.status === 'online') {
                setStatus('success');
            } else {
                setStatus('error');
            }
        } catch (e) {
            console.error(e);
            setStatus('error');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div>
                <h1 className="text-3xl font-black mb-1">Configuración</h1>
                <p className="text-[var(--text-secondary)]">Gestiona la infraestructura y API keys de tu motor IA.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Connection Card */}
                <div className="lg:col-span-2 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-[var(--border-light)] bg-white/5">
                        <h2 className="text-lg font-black flex items-center gap-3 uppercase tracking-widest">
                            <Server className="text-[var(--primary)]" />
                            Backend Engine
                        </h2>
                        <p className="text-[var(--text-tertiary)] text-xs mt-1 font-bold">CONFIGURACIÓN DE NGROK & COLAB</p>
                    </div>

                    <div className="p-8 space-y-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.2em] px-2">Public Endpoint URL</label>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 relative group">
                                    <div className="absolute inset-y-0 left-4 flex items-center text-[var(--text-tertiary)] group-focus-within:text-[var(--primary)] transition-colors">
                                        <Sparkles size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        value={apiUrl}
                                        onChange={(e) => setApiUrl(e.target.value)}
                                        placeholder="https://xxxx-xx-xx-xx-xx.ngrok-free.app"
                                        className="w-full bg-[var(--bg-input)]/50 border border-[var(--border-light)] rounded-2xl pl-12 pr-4 py-4 text-white text-sm font-medium outline-none focus:border-[var(--primary)]/50 transition-all shadow-inner"
                                    />
                                </div>
                                <button
                                    onClick={handleSave}
                                    className="px-8 py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3 shrink-0"
                                >
                                    <Save size={18} />
                                    Vincular Server
                                </button>
                            </div>
                            <p className="text-[11px] text-[var(--text-tertiary)] px-2 font-medium">
                                Copia la **URL de Ngrok** generada por el notebook <code className="text-[var(--primary)]">Enfoads_Colab.ipynb</code>.
                            </p>
                        </div>

                        {/* Status Feedback */}
                        {status === 'success' && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem] p-6 flex items-center gap-4 text-emerald-400">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div>
                                    <p className="font-black text-sm uppercase tracking-wider">Engine Online</p>
                                    <p className="text-xs opacity-80 font-medium">La comunicación con la GPU de Google Colab es estable.</p>
                                </div>
                            </motion.div>
                        )}

                        {status === 'error' && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-500/5 border border-red-500/20 rounded-[2rem] p-6 flex items-center gap-4 text-red-400">
                                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                                    <AlertCircle size={24} />
                                </div>
                                <div>
                                    <p className="font-black text-sm uppercase tracking-wider">Error de Enlace</p>
                                    <p className="text-xs opacity-80 font-medium">No se detecta el servidor. Verifica que el proceso no haya expirado en Colab.</p>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-gradient-to-br from-[var(--bg-card)] to-transparent border border-[var(--border-light)] rounded-[2.5rem] p-8 flex flex-col gap-6 shadow-xl">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
                        <Key size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black mb-2">Seguridad</h3>
                        <p className="text-sm text-[var(--text-tertiary)] leading-relaxed font-medium">
                            Tu URL de conexión se almacena localmente en este navegador. Nunca compartas tu endpoint público de Ngrok.
                        </p>
                    </div>
                    <div className="mt-auto pt-6 border-t border-[var(--border-light)]">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-tertiary)] mb-2">Estado del Plan</p>
                        <div className="px-4 py-2 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] rounded-xl text-center text-xs font-black text-white uppercase tracking-widest shadow-lg shadow-[var(--primary-glow)]">
                            Premium Life
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
