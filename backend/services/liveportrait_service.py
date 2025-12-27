"""
Servicio de animación facial usando LivePortrait.
Anima imágenes estáticas con audio para crear videos realistas.
"""

import os
import subprocess
import shutil
from typing import Optional, Dict, Any
import base64
from io import BytesIO
from PIL import Image

class LivePortraitService:
    def __init__(self, liveportrait_dir: str = "LivePortrait"):
        self.liveportrait_dir = liveportrait_dir
        self.is_available = os.path.exists(liveportrait_dir)
        
        if not self.is_available:
            print(f"[!] LivePortrait not found at {liveportrait_dir}")
            print("[!] Run setup_liveportrait.py to install")
    
    def check_installation(self) -> bool:
        """
        Verifica si LivePortrait está instalado correctamente.
        
        Returns:
            True si está instalado, False si no
        """
        required_files = [
            os.path.join(self.liveportrait_dir, "inference.py"),
            os.path.join(self.liveportrait_dir, "src"),
        ]
        
        for file_path in required_files:
            if not os.path.exists(file_path):
                print(f"[!] Missing: {file_path}")
                return False
        
        self.is_available = True
        return True
    
    def animate_portrait(
        self,
        source_image_path: str,
        driving_audio_path: str,
        output_dir: str,
        **kwargs
    ) -> Optional[str]:
        """
        Anima un retrato con audio usando LivePortrait.
        
        Args:
            source_image_path: Ruta a la imagen del rostro
            driving_audio_path: Ruta al archivo de audio
            output_dir: Directorio donde guardar el resultado
            **kwargs: Parámetros adicionales para LivePortrait
        
        Returns:
            Ruta al video generado o None si falla
        """
        if not self.is_available:
            print("[!] LivePortrait not available")
            return self._create_fallback_video(source_image_path, driving_audio_path, output_dir)
        
        try:
            os.makedirs(output_dir, exist_ok=True)
            
            # Construir comando para LivePortrait
            cmd = [
                "python",
                os.path.join(self.liveportrait_dir, "inference.py"),
                "--source", source_image_path,
                "--driving_audio", driving_audio_path,
                "--output_dir", output_dir,
            ]
            
            # Agregar parámetros opcionales
            if kwargs.get('flag_lip_zero', False):
                cmd.append("--flag_lip_zero")
            if kwargs.get('flag_eye_retargeting', False):
                cmd.append("--flag_eye_retargeting")
            if kwargs.get('flag_stitching', True):
                cmd.append("--flag_stitching")
            
            print(f"[*] Running LivePortrait: {' '.join(cmd)}")
            
            # Ejecutar LivePortrait
            result = subprocess.run(
                cmd,
                cwd=self.liveportrait_dir,
                capture_output=True,
                text=True,
                timeout=300  # 5 minutos timeout
            )
            
            if result.returncode != 0:
                print(f"[!] LivePortrait error: {result.stderr}")
                return self._create_fallback_video(source_image_path, driving_audio_path, output_dir)
            
            # Buscar video generado
            video_path = self._find_output_video(output_dir)
            
            if video_path:
                print(f"[✓] LivePortrait animation created: {video_path}")
                return video_path
            else:
                print("[!] LivePortrait output not found")
                return self._create_fallback_video(source_image_path, driving_audio_path, output_dir)
        
        except subprocess.TimeoutExpired:
            print("[!] LivePortrait timeout")
            return self._create_fallback_video(source_image_path, driving_audio_path, output_dir)
        except Exception as e:
            print(f"[!] LivePortrait exception: {str(e)}")
            return self._create_fallback_video(source_image_path, driving_audio_path, output_dir)
    
    def _find_output_video(self, output_dir: str) -> Optional[str]:
        """
        Busca el video de salida en el directorio.
        
        Args:
            output_dir: Directorio donde buscar
        
        Returns:
            Ruta al video o None
        """
        import glob
        
        # Buscar archivos .mp4 recursivamente
        video_files = glob.glob(os.path.join(output_dir, "**", "*.mp4"), recursive=True)
        
        if video_files:
            # Ordenar por fecha de modificación (más reciente primero)
            video_files.sort(key=os.path.getmtime, reverse=True)
            return video_files[0]
        
        return None
    
    def _create_fallback_video(
        self,
        image_path: str,
        audio_path: str,
        output_dir: str
    ) -> str:
        """
        Crea un video estático con audio como fallback.
        
        Args:
            image_path: Ruta a la imagen
            audio_path: Ruta al audio
            output_dir: Directorio de salida
        
        Returns:
            Ruta al video generado
        """
        print("[*] Creating fallback static video with FFmpeg...")
        
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, "fallback_video.mp4")
        
        # Comando FFmpeg para crear video estático con audio
        cmd = [
            "ffmpeg", "-y",
            "-loop", "1",
            "-i", image_path,
            "-i", audio_path,
            "-c:v", "libx264",
            "-tune", "stillimage",
            "-c:a", "aac",
            "-b:a", "192k",
            "-pix_fmt", "yuv420p",
            "-shortest",
            output_path
        ]
        
        try:
            subprocess.run(cmd, check=True, capture_output=True)
            print(f"[✓] Fallback video created: {output_path}")
            return output_path
        except subprocess.CalledProcessError as e:
            print(f"[!] FFmpeg error: {e.stderr.decode()}")
            raise Exception("Failed to create fallback video")
    
    def animate_from_base64(
        self,
        base64_image: str,
        audio_path: str,
        output_dir: str,
        **kwargs
    ) -> Optional[str]:
        """
        Anima una imagen desde base64.
        
        Args:
            base64_image: Imagen en formato base64
            audio_path: Ruta al archivo de audio
            output_dir: Directorio de salida
            **kwargs: Parámetros adicionales
        
        Returns:
            Ruta al video generado
        """
        # Guardar imagen base64 temporalmente
        temp_image_path = os.path.join(output_dir, "temp_source.png")
        
        # Decodificar base64
        if 'base64,' in base64_image:
            base64_image = base64_image.split('base64,')[1]
        
        image_bytes = base64.b64decode(base64_image)
        image = Image.open(BytesIO(image_bytes))
        image.save(temp_image_path)
        
        # Animar
        return self.animate_portrait(temp_image_path, audio_path, output_dir, **kwargs)
    
    def get_status(self) -> Dict[str, Any]:
        """
        Obtiene el estado del servicio LivePortrait.
        
        Returns:
            Diccionario con información del estado
        """
        return {
            'available': self.is_available,
            'directory': self.liveportrait_dir,
            'installed': self.check_installation() if self.is_available else False
        }

# Singleton instance
_liveportrait_service = None

def get_liveportrait_service() -> LivePortraitService:
    """Obtiene la instancia singleton del servicio LivePortrait."""
    global _liveportrait_service
    if _liveportrait_service is None:
        _liveportrait_service = LivePortraitService()
    return _liveportrait_service
