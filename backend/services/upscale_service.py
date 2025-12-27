"""
Servicio de upscaling usando Real-ESRGAN.
Mejora la resolución de imágenes hasta 4x.
"""

import os
import cv2
import numpy as np
from typing import Optional
import base64
from io import BytesIO
from PIL import Image

class RealESRGANService:
    def __init__(self):
        self.model = None
        self.device = None
        self.model_loaded = False
    
    def load_model(self, model_name: str = 'RealESRGAN_x4plus'):
        """
        Carga el modelo Real-ESRGAN.
        
        Args:
            model_name: Nombre del modelo a usar
                - 'RealESRGAN_x4plus': General purpose 4x upscaling
                - 'RealESRGAN_x4plus_anime_6B': Optimizado para anime
        """
        try:
            import torch
            from basicsr.archs.rrdbnet_arch import RRDBNet
            from realesrgan import RealESRGANer
            
            # Determinar dispositivo
            self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
            
            print(f"[*] Loading Real-ESRGAN model: {model_name} on {self.device}...")
            
            # Configuración del modelo
            if model_name == 'RealESRGAN_x4plus':
                model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, 
                               num_block=23, num_grow_ch=32, scale=4)
                netscale = 4
                model_path = 'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth'
            elif model_name == 'RealESRGAN_x4plus_anime_6B':
                model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, 
                               num_block=6, num_grow_ch=32, scale=4)
                netscale = 4
                model_path = 'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth'
            else:
                raise ValueError(f"Unknown model: {model_name}")
            
            # Crear upsampler
            self.model = RealESRGANer(
                scale=netscale,
                model_path=model_path,
                model=model,
                tile=0,  # 0 = no tiling, use if VRAM is sufficient
                tile_pad=10,
                pre_pad=0,
                half=True if self.device == 'cuda' else False,
                device=self.device
            )
            
            self.model_loaded = True
            print(f"[✓] Real-ESRGAN model loaded successfully")
            
        except ImportError:
            print("[!] Real-ESRGAN dependencies not installed")
            print("[!] Install with: pip install realesrgan basicsr")
            self.model_loaded = False
        except Exception as e:
            print(f"[!] Error loading Real-ESRGAN: {str(e)}")
            self.model_loaded = False
    
    def upscale_image(self, image: np.ndarray, outscale: float = 4.0) -> np.ndarray:
        """
        Upscale una imagen usando Real-ESRGAN.
        
        Args:
            image: Imagen en formato numpy array (BGR)
            outscale: Factor de escalado (default: 4.0)
        
        Returns:
            Imagen upscaled en formato numpy array
        """
        if not self.model_loaded:
            self.load_model()
        
        if not self.model_loaded:
            # Fallback: usar interpolación bicúbica
            print("[!] Using fallback bicubic interpolation")
            h, w = image.shape[:2]
            new_h, new_w = int(h * outscale), int(w * outscale)
            return cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_CUBIC)
        
        try:
            # Ejecutar upscaling
            output, _ = self.model.enhance(image, outscale=outscale)
            return output
        except Exception as e:
            print(f"[!] Upscaling error: {str(e)}, using fallback")
            h, w = image.shape[:2]
            new_h, new_w = int(h * outscale), int(w * outscale)
            return cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_CUBIC)
    
    def upscale_from_base64(self, base64_image: str, outscale: float = 4.0) -> str:
        """
        Upscale una imagen desde base64 y retorna base64.
        
        Args:
            base64_image: Imagen en formato base64 (con o sin prefijo data:image)
            outscale: Factor de escalado
        
        Returns:
            Imagen upscaled en formato base64
        """
        # Remover prefijo si existe
        if 'base64,' in base64_image:
            base64_image = base64_image.split('base64,')[1]
        
        # Decodificar base64 a imagen
        image_bytes = base64.b64decode(base64_image)
        image = Image.open(BytesIO(image_bytes))
        
        # Convertir a numpy array (RGB -> BGR para OpenCV)
        image_np = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Upscale
        upscaled_np = self.upscale_image(image_np, outscale)
        
        # Convertir de vuelta a PIL Image (BGR -> RGB)
        upscaled_pil = Image.fromarray(cv2.cvtColor(upscaled_np, cv2.COLOR_BGR2RGB))
        
        # Convertir a base64
        buffered = BytesIO()
        upscaled_pil.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')
        
        return f"data:image/png;base64,{img_str}"
    
    def upscale_file(self, input_path: str, output_path: str, outscale: float = 4.0):
        """
        Upscale una imagen desde archivo.
        
        Args:
            input_path: Ruta de la imagen de entrada
            output_path: Ruta donde guardar la imagen upscaled
            outscale: Factor de escalado
        """
        # Leer imagen
        image = cv2.imread(input_path, cv2.IMREAD_COLOR)
        
        if image is None:
            raise ValueError(f"Could not read image: {input_path}")
        
        # Upscale
        upscaled = self.upscale_image(image, outscale)
        
        # Guardar
        cv2.imwrite(output_path, upscaled)
        print(f"[✓] Upscaled image saved to: {output_path}")
    
    def offload_to_cpu(self):
        """Mueve el modelo a CPU para liberar VRAM."""
        if self.model and self.model_loaded:
            try:
                import torch
                if hasattr(self.model, 'model'):
                    self.model.model.to('cpu')
                torch.cuda.empty_cache()
                print("[*] Real-ESRGAN offloaded to CPU")
            except:
                pass

# Singleton instance
_esrgan_service = None

def get_esrgan_service() -> RealESRGANService:
    """Obtiene la instancia singleton del servicio Real-ESRGAN."""
    global _esrgan_service
    if _esrgan_service is None:
        _esrgan_service = RealESRGANService()
    return _esrgan_service
