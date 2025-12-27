import { useState, useEffect } from 'react';
import { Save, Server, CheckCircle2, AlertCircle } from 'lucide-react';
import '../styles/variables.css';

export default function Settings() {
    const [apiUrl, setApiUrl] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    useEffect(() => {
        const savedUrl = localStorage.getItem('FOADS_API_URL');
        if (savedUrl) setApiUrl(savedUrl);
    }, []);

    const handleSave = async () => {
        // Basic validation
        let cleanUrl = apiUrl.trim();
        if (cleanUrl.endsWith('/')) cleanUrl = cleanUrl.slice(0, -1);

        localStorage.setItem('FOADS_API_URL', cleanUrl);

        // Test Connection
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
        <div className="max-w-3xl mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">Configuración</h1>

            <div className="bg-[var(--bg-card)] border border-[var(--border-light)] rounded-xl overflow-hidden">
                <div className="p-6 border-b border-[var(--border-light)]">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Server className="text-[var(--primary)]" />
                        Conexión Backend
                    </h2>
                    <p className="text-[var(--text-secondary)] mt-1">Configura la conexión con tu servidor de Google Colab.</p>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--text-secondary)]">URL Pública de Ngrok</label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={apiUrl}
                                onChange={(e) => setApiUrl(e.target.value)}
                                placeholder="https://xxxx-xx-xx-xx-xx.ngrok-free.app"
                                className="flex-1 bg-[var(--bg-input)] border border-[var(--border-light)] rounded-lg px-4 py-2.5 outline-none focus:border-[var(--primary)] transition-colors"
                            />
                            <button
                                onClick={handleSave}
                                className="px-6 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                                <Save size={18} />
                                Guardar y Probar
                            </button>
                        </div>
                        <p className="text-xs text-[var(--text-tertiary)]">
                            Copia la URL que aparece al final de tu notebook `Enfoads_Colab.ipynb` en ejecución.
                        </p>
                    </div>

                    {/* Status Feedback */}
                    {status === 'success' && (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-3 text-green-500">
                            <CheckCircle2 size={20} />
                            <div>
                                <p className="font-medium">Conectado exitosamente</p>
                                <p className="text-xs opacity-80">El backend está respondiendo correctamente.</p>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3 text-red-500">
                            <AlertCircle size={20} />
                            <div>
                                <p className="font-medium">Error de conexión</p>
                                <p className="text-xs opacity-80">No se pudo conectar. Verifica que la URL sea correcta y el Colab esté corriedo.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
