
import React from 'react';
import { BrandImage } from '../types';

interface GalleryProps {
  images: BrandImage[];
  onToggleSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const Gallery: React.FC<GalleryProps> = ({ images, onToggleSelect, onDelete }) => {
  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div className="flex items-center justify-between border-b border-border-dark pb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          Galería 
          <span className="bg-surface-dark border border-border-dark px-2 py-0.5 rounded text-xs text-gray-400 font-medium">
            {images.length} imágenes
          </span>
        </h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-primary font-bold">{images.length}</span>
          <span className="text-gray-500">/ 40 máximo</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {images.map((img) => (
          <div 
            key={img.id}
            onClick={() => onToggleSelect(img.id)}
            className="group relative aspect-square rounded-xl overflow-hidden bg-surface-dark border border-border-dark hover:border-primary transition-colors cursor-pointer"
          >
            <img 
              src={img.url} 
              alt={img.alt} 
              className={`w-full h-full object-cover transition-opacity duration-300 ${img.selected ? 'opacity-100' : 'opacity-40 group-hover:opacity-60'}`}
            />
            
            {img.selected && (
              <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-md scale-100 animate-fade-in">
                <span className="material-symbols-outlined text-white text-sm font-bold">check</span>
              </div>
            )}

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(img.id);
                }}
                className="h-10 w-10 rounded-full bg-red-500/90 text-white flex items-center justify-center hover:bg-red-600 transition-all transform hover:scale-110 active:scale-90"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          </div>
        ))}

        {images.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-500 border border-dashed border-border-dark rounded-xl">
            <span className="material-symbols-outlined text-4xl mb-2">image_not_supported</span>
            <p>No hay imágenes cargadas aún.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
