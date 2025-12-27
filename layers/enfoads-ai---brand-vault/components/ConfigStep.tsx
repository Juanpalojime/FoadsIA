
import React, { useState, useEffect } from 'react';
import { BrandImage } from '../types';
import { analyzeBrandAssets } from '../services/geminiService';

interface ConfigStepProps {
  images: BrandImage[];
  onBack: () => void;
}

const ConfigStep: React.FC<ConfigStepProps> = ({ images, onBack }) => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runAnalysis = async () => {
      const result = await analyzeBrandAssets(images.map(i => i.url));
      setAnalysis(result);
      setLoading(false);
    };
    runAnalysis();
  }, [images]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 animate-pulse">
        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        <p className="text-primary font-bold">Analizando activos con Gemini...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <h3 className="text-2xl font-bold">Configuración de Marca</h3>
        <div className="bg-surface-dark p-6 rounded-2xl border border-border-dark space-y-4">
          <label className="block text-sm font-medium text-gray-400">Nombre del Perfil de Marca</label>
          <input type="text" defaultValue="Urban Shoes 2024" className="w-full bg-surface-darker border-border-dark rounded-lg text-white focus:ring-primary focus:border-primary" />
          
          <label className="block text-sm font-medium text-gray-400 pt-2">Descripción Visual (IA)</label>
          <textarea rows={4} className="w-full bg-surface-darker border-border-dark rounded-lg text-white focus:ring-primary focus:border-primary" placeholder="Describe el estilo visual..." defaultValue={analysis?.themes?.join(', ')} />
        </div>

        <div className="bg-surface-dark p-6 rounded-2xl border border-border-dark space-y-4">
          <h4 className="font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">palette</span>
            Colores Sugeridos
          </h4>
          <div className="flex gap-4">
            {analysis?.suggestedColors?.map((color: string) => (
              <div key={color} className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-lg border border-white/20 shadow-lg" style={{ backgroundColor: color }}></div>
                <span className="text-xs text-gray-400 font-mono">{color}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-surface-dark p-8 rounded-2xl border border-border-dark h-fit sticky top-4">
        <h4 className="text-xl font-bold mb-6">Resumen del Análisis</h4>
        <div className="space-y-6">
          <section>
            <p className="text-sm font-bold text-primary mb-2 uppercase tracking-widest">Temas Visuales</p>
            <div className="flex flex-wrap gap-2">
              {analysis?.themes?.map((t: string) => (
                <span key={t} className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs text-primary">{t}</span>
              ))}
            </div>
          </section>

          <section>
            <p className="text-sm font-bold text-primary mb-2 uppercase tracking-widest">Público Objetivo</p>
            <ul className="text-sm text-gray-400 list-disc list-inside space-y-1">
              {analysis?.audience?.map((a: string) => <li key={a}>{a}</li>)}
            </ul>
          </section>

          <button className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 mt-4">
            Confirmar y Revisar
          </button>
          <button onClick={onBack} className="w-full text-gray-500 hover:text-white transition-colors text-sm">
            Volver a galería
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigStep;
