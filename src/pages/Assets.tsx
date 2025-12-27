import { useState, useEffect } from 'react';
import { Folder, Trash2, Download, CloudSync, CheckCircle2, RefreshCw } from 'lucide-react';
import { db, type Asset } from '../services/db';
import clsx from 'clsx';

export default function Assets() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncSuccess, setSyncSuccess] = useState(false);

    useEffect(() => {
        loadAssets();
    }, []);

    const loadAssets = async () => {
        try {
            const items = await db.getAllAssets();
            setAssets(items);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setIsSyncing(true);
        setSyncSuccess(false);
        // Simulate network latency for cloud sync
        await new Promise(r => setTimeout(r, 2000));
        setIsSyncing(false);
        setSyncSuccess(true);
        setTimeout(() => setSyncSuccess(false), 3000);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar este archivo?')) return;
        await db.deleteAsset(id);
        loadAssets();
    };

    return (
        <div className="max-w-6xl mx-auto h-full flex flex-col">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Mis Archivos</h1>
                    <p className="text-[var(--text-secondary)]">Gestiona tus videos e imágenes generados.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className={clsx(
                            "flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-bold text-xs uppercase tracking-widest border shadow-sm",
                            syncSuccess
                                ? "bg-[var(--success)]/10 border-[var(--success)] text-[var(--success)]"
                                : "bg-[var(--bg-card)] border-[var(--border-light)] text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                        )}
                    >
                        {isSyncing ? <RefreshCw size={14} className="animate-spin" /> : syncSuccess ? <CheckCircle2 size={14} /> : <CloudSync size={14} />}
                        {isSyncing ? "Sincronizando..." : syncSuccess ? "Sincronizado" : "Sincronizar Nube"}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors text-xs font-bold shadow-[var(--shadow-glow)]" onClick={loadAssets}>
                        REFRESCAR
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center text-[var(--text-tertiary)]">Cargando...</div>
            ) : assets.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-tertiary)] border-2 border-dashed border-[var(--border-light)] rounded-2xl bg-[var(--bg-card)]/30">
                    <Folder size={48} className="mb-4 opacity-50" />
                    <p>Aún no has generado contenido.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pb-4 custom-scrollbar">
                    {assets.map((asset) => (
                        <div key={asset.id} className="group relative aspect-square bg-[var(--bg-card)] rounded-xl overflow-hidden border border-[var(--border-light)] hover:border-[var(--primary)] transition-all">
                            {asset.type === 'image' && (
                                <img src={asset.content} alt={asset.prompt} className="w-full h-full object-cover" />
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                <p className="text-xs text-white line-clamp-2 mb-2">{asset.prompt}</p>
                                <div className="flex gap-2 justify-end">
                                    <button onClick={() => handleDelete(asset.id!)} className="p-2 bg-red-500/20 text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                    <a href={asset.content} download={`asset-${asset.id}.png`} className="p-2 bg-[var(--primary)]/20 text-[var(--primary)] rounded hover:bg-[var(--primary)] hover:text-white transition-colors">
                                        <Download size={14} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
