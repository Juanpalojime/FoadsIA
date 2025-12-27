"""
Sistema de caché de imágenes para evitar regenerar contenido idéntico.
Usa hash MD5 de los parámetros de generación como clave.
"""

import os
import hashlib
import json
import time
from typing import Optional, Dict, Any

class ImageCacheService:
    def __init__(self, cache_dir: str = "data/cache"):
        self.cache_dir = cache_dir
        self.metadata_file = os.path.join(cache_dir, "cache_metadata.json")
        os.makedirs(cache_dir, exist_ok=True)
        self.metadata = self._load_metadata()
    
    def _load_metadata(self) -> Dict:
        """Carga metadata del caché desde disco."""
        if os.path.exists(self.metadata_file):
            try:
                with open(self.metadata_file, 'r') as f:
                    return json.load(f)
            except:
                return {}
        return {}
    
    def _save_metadata(self):
        """Guarda metadata del caché a disco."""
        with open(self.metadata_file, 'w') as f:
            json.dump(self.metadata, f, indent=2)
    
    def get_cache_key(self, prompt: str, steps: int = 4, guidance: float = 0, 
                     width: int = 1024, height: int = 1024, **kwargs) -> str:
        """
        Genera una clave única basada en los parámetros de generación.
        
        Args:
            prompt: Texto del prompt
            steps: Número de pasos de inferencia
            guidance: Guidance scale
            width: Ancho de la imagen
            height: Alto de la imagen
            **kwargs: Otros parámetros opcionales
        
        Returns:
            Hash MD5 de los parámetros
        """
        # Crear string con todos los parámetros
        params = f"{prompt}_{steps}_{guidance}_{width}_{height}"
        
        # Agregar kwargs ordenados alfabéticamente para consistencia
        for key in sorted(kwargs.keys()):
            params += f"_{key}_{kwargs[key]}"
        
        # Generar hash MD5
        return hashlib.md5(params.encode()).hexdigest()
    
    def get_cached_image(self, cache_key: str) -> Optional[bytes]:
        """
        Recupera una imagen del caché si existe.
        
        Args:
            cache_key: Clave del caché
        
        Returns:
            Bytes de la imagen o None si no existe
        """
        cache_path = os.path.join(self.cache_dir, f"{cache_key}.png")
        
        if os.path.exists(cache_path):
            # Actualizar timestamp de último acceso
            if cache_key in self.metadata:
                self.metadata[cache_key]['last_accessed'] = time.time()
                self.metadata[cache_key]['access_count'] = self.metadata[cache_key].get('access_count', 0) + 1
                self._save_metadata()
            
            with open(cache_path, 'rb') as f:
                print(f"[✓] Cache HIT: {cache_key}")
                return f.read()
        
        print(f"[*] Cache MISS: {cache_key}")
        return None
    
    def save_to_cache(self, cache_key: str, image_bytes: bytes, metadata: Dict[str, Any] = None):
        """
        Guarda una imagen en el caché.
        
        Args:
            cache_key: Clave del caché
            image_bytes: Bytes de la imagen
            metadata: Metadata adicional (prompt, parámetros, etc.)
        """
        cache_path = os.path.join(self.cache_dir, f"{cache_key}.png")
        
        # Guardar imagen
        with open(cache_path, 'wb') as f:
            f.write(image_bytes)
        
        # Guardar metadata
        self.metadata[cache_key] = {
            'created_at': time.time(),
            'last_accessed': time.time(),
            'access_count': 1,
            'size_bytes': len(image_bytes),
            **(metadata or {})
        }
        self._save_metadata()
        
        print(f"[✓] Cached: {cache_key}")
    
    def clear_old_cache(self, max_age_days: int = 7):
        """
        Limpia entradas del caché más antiguas que max_age_days.
        
        Args:
            max_age_days: Edad máxima en días
        """
        current_time = time.time()
        max_age_seconds = max_age_days * 24 * 60 * 60
        
        keys_to_remove = []
        
        for cache_key, meta in self.metadata.items():
            age = current_time - meta.get('created_at', 0)
            if age > max_age_seconds:
                keys_to_remove.append(cache_key)
        
        # Eliminar archivos y metadata
        for cache_key in keys_to_remove:
            cache_path = os.path.join(self.cache_dir, f"{cache_key}.png")
            if os.path.exists(cache_path):
                os.remove(cache_path)
            del self.metadata[cache_key]
        
        if keys_to_remove:
            self._save_metadata()
            print(f"[✓] Removed {len(keys_to_remove)} old cache entries")
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """
        Obtiene estadísticas del caché.
        
        Returns:
            Diccionario con estadísticas
        """
        total_size = sum(meta.get('size_bytes', 0) for meta in self.metadata.values())
        total_accesses = sum(meta.get('access_count', 0) for meta in self.metadata.values())
        
        return {
            'total_entries': len(self.metadata),
            'total_size_mb': round(total_size / (1024 * 1024), 2),
            'total_accesses': total_accesses,
            'cache_dir': self.cache_dir
        }

# Singleton instance
_cache_service = None

def get_cache_service() -> ImageCacheService:
    """Obtiene la instancia singleton del servicio de caché."""
    global _cache_service
    if _cache_service is None:
        _cache_service = ImageCacheService()
    return _cache_service
