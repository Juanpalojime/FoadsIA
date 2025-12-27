
import React from 'react';
import { BrandImage } from '../types';

interface ReviewStepProps {
  images: BrandImage[];
  onRestart: () => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ images, onRestart }) => {
  return (
    <div className="animate-fade-in max-w-2xl mx-auto flex flex-col items-center text-center py-12">
      <div className="h-20 w-20 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mb-6 border border-green-500/30">
        <span className="material-symbols-outlined text-4xl">check_circle</span>
      </div>
      <h3 className="text-3xl font-bold mb-4">¡Todo listo para entrenar!</h3>
      <p className="text-gray-400 mb-8 leading-relaxed">
        Hemos procesado tus activos. Tu modelo de IA se entrenará utilizando las {images.filter(i => i.selected).length} imágenes seleccionadas. Este proceso suele tardar entre 20 y 30 minutos.
      </p>

      <div className="w-full grid grid-cols-4 gap-2 mb-12">
        {images.filter(i => i.selected).slice(0, 8).map(img => (
          <img key={img.id} src={img.url} className="aspect-square object-cover rounded-lg grayscale hover:grayscale-0 transition-all cursor-crosshair border border-border-dark" />
        ))}
      </div>

      <div className="flex gap-4 w-full">
        <button onClick={onRestart} className="flex-1 px-6 py-3 rounded-xl border border-border-dark text-gray-400 hover:text-white hover:bg-surface-dark transition-all">
          Modificar activos
        </button>
        <button className="flex-1 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold shadow-lg shadow-primary/30 transition-all transform hover:scale-[1.02]">
          Iniciar Entrenamiento
        </button>
      </div>
    </div>
  );
};

export default ReviewStep;
