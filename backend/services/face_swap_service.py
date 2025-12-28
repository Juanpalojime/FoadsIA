"""
Face Swap Service usando InsightFace
Optimizado para Google Colab T4 GPU
"""

import cv2
import os
import numpy as np
from typing import Optional
import base64
from io import BytesIO
from PIL import Image

class FaceSwapService:
    """Servicio de intercambio de rostros usando InsightFace."""
    
    def __init__(self):
        self.app = None
        self.swapper = None
        self._initialized = False
    
    def initialize(self):
        """Inicializa los modelos de InsightFace (lazy loading)."""
        if self._initialized:
            return
        
        try:
            import insightface
            from insightface.app import FaceAnalysis
            
            print("[*] Inicializando InsightFace...")
            
            # Definir rutas base
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            models_root = os.path.join(base_dir, "models", "insightface")
            checkpoints_dir = os.path.join(base_dir, "models", "checkpoints")

            # Análisis de rostros (buffalo_l se descargará/buscará en models/insightface)
            self.app = FaceAnalysis(name='buffalo_l', root=models_root)
            self.app.prepare(ctx_id=0, det_size=(640, 640))
            
            # Modelo de swap
            # Buscamos inswapper_128.onnx en models/checkpoints
            swapper_path = os.path.join(checkpoints_dir, 'inswapper_128.onnx')
            
            if os.path.exists(swapper_path):
                self.swapper = insightface.model_zoo.get_model(swapper_path)
            else:
                print(f"[!] Modelo inswapper no encontrado en {swapper_path}")
                # Fallback: intentar descarga automática o ubicación default
                # InsightFace por defecto busca en ~/.insightface/models/
                try:
                     self.swapper = insightface.model_zoo.get_model('inswapper_128.onnx')
                except:
                     self.swapper = None

            self._initialized = True
            print("[✓] InsightFace inicializado")
            
        except Exception as e:
            print(f"[!] Error inicializando InsightFace: {e}")
            raise
    
    def base64_to_image(self, base64_str: str) -> np.ndarray:
        """Convierte imagen base64 a numpy array (BGR)."""
        # Remover prefijo data:image si existe
        if ',' in base64_str:
            base64_str = base64_str.split(',')[1]
        
        img_data = base64.b64decode(base64_str)
        img = Image.open(BytesIO(img_data))
        img = img.convert('RGB')
        img_array = np.array(img)
        
        # Convertir RGB a BGR (OpenCV format)
        img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
        return img_bgr
    
    def image_to_base64(self, img: np.ndarray) -> str:
        """Convierte numpy array (BGR) a base64."""
        # Convertir BGR a RGB
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        pil_img = Image.fromarray(img_rgb)
        
        buffered = BytesIO()
        pil_img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')
        
        return f"data:image/png;base64,{img_str}"
    
    def swap_faces(self, source_img: np.ndarray, target_img: np.ndarray) -> Optional[np.ndarray]:
        """
        Intercambia rostros entre dos imágenes.
        
        Args:
            source_img: Imagen fuente (de donde se toma el rostro)
            target_img: Imagen objetivo (donde se coloca el rostro)
        
        Returns:
            Imagen con rostros intercambiados o None si falla
        """
        if not self._initialized:
            self.initialize()
        
        if self.swapper is None:
            raise Exception("Modelo de face swap no disponible")
        
        try:
            # Detectar rostros en imagen fuente
            source_faces = self.app.get(source_img)
            if len(source_faces) == 0:
                raise Exception("No se detectó rostro en la imagen fuente")
            
            source_face = source_faces[0]  # Usar primer rostro
            
            # Detectar rostros en imagen objetivo
            target_faces = self.app.get(target_img)
            if len(target_faces) == 0:
                raise Exception("No se detectó rostro en la imagen objetivo")
            
            # Realizar swap en todos los rostros detectados
            result = target_img.copy()
            for target_face in target_faces:
                result = self.swapper.get(result, target_face, source_face, paste_back=True)
            
            return result
            
        except Exception as e:
            print(f"[!] Error en face swap: {e}")
            raise
    
    def process_base64(self, source_b64: str, target_b64: str) -> str:
        """
        Procesa imágenes en formato base64.
        
        Args:
            source_b64: Imagen fuente en base64
            target_b64: Imagen objetivo en base64
        
        Returns:
            Imagen resultado en base64
        """
        # Convertir base64 a imágenes
        source_img = self.base64_to_image(source_b64)
        target_img = self.base64_to_image(target_b64)
        
        # Realizar swap
        result_img = self.swap_faces(source_img, target_img)
        
        # Convertir resultado a base64
        result_b64 = self.image_to_base64(result_img)
        
        return result_b64
    
    def cleanup(self):
        """Libera recursos."""
        if self.app is not None:
            del self.app
        if self.swapper is not None:
            del self.swapper
        
        self._initialized = False
        
        # Limpiar VRAM si está disponible
        try:
            import torch
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
        except:
            pass

# Instancia global (singleton)
_face_swap_service = None

def get_face_swap_service() -> FaceSwapService:
    """Obtiene la instancia singleton del servicio."""
    global _face_swap_service
    if _face_swap_service is None:
        _face_swap_service = FaceSwapService()
    return _face_swap_service
