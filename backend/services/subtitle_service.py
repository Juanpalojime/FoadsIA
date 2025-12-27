"""
Servicio de subtítulos automáticos usando Faster-Whisper.
Transcribe audio y genera subtítulos sincronizados.
"""

import os
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass

@dataclass
class SubtitleSegment:
    """Representa un segmento de subtítulo."""
    start: float
    end: float
    text: str
    
    def to_srt_format(self, index: int) -> str:
        """Convierte el segmento a formato SRT."""
        start_time = self._format_timestamp(self.start)
        end_time = self._format_timestamp(self.end)
        return f"{index}\n{start_time} --> {end_time}\n{self.text}\n\n"
    
    def _format_timestamp(self, seconds: float) -> str:
        """Formatea segundos a timestamp SRT (HH:MM:SS,mmm)."""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millis = int((seconds % 1) * 1000)
        return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"

class SubtitleService:
    def __init__(self):
        self.whisper_model = None
        self.model_loaded = False
    
    def load_model(self, model_size: str = "base", device: str = "cuda", compute_type: str = "float16"):
        """
        Carga el modelo Faster-Whisper.
        
        Args:
            model_size: Tamaño del modelo (tiny, base, small, medium, large)
            device: Dispositivo (cuda o cpu)
            compute_type: Tipo de cómputo (float16, int8, etc.)
        """
        try:
            from faster_whisper import WhisperModel
            
            print(f"[*] Loading Whisper model: {model_size} on {device}...")
            
            self.whisper_model = WhisperModel(
                model_size,
                device=device,
                compute_type=compute_type
            )
            
            self.model_loaded = True
            print(f"[✓] Whisper model loaded successfully")
            
        except ImportError:
            print("[!] Faster-Whisper not installed")
            print("[!] Install with: pip install faster-whisper")
            self.model_loaded = False
        except Exception as e:
            print(f"[!] Error loading Whisper: {str(e)}")
            self.model_loaded = False
    
    def transcribe_audio(
        self,
        audio_path: str,
        language: Optional[str] = None,
        beam_size: int = 5
    ) -> Tuple[List[SubtitleSegment], Dict[str, Any]]:
        """
        Transcribe un archivo de audio.
        
        Args:
            audio_path: Ruta al archivo de audio
            language: Código de idioma (es, en, etc.) o None para auto-detectar
            beam_size: Tamaño del beam search (mayor = más preciso pero más lento)
        
        Returns:
            Tupla de (lista de segmentos, información de transcripción)
        """
        if not self.model_loaded:
            self.load_model()
        
        if not self.model_loaded:
            raise Exception("Whisper model not available")
        
        print(f"[*] Transcribing audio: {audio_path}")
        
        # Transcribir
        segments, info = self.whisper_model.transcribe(
            audio_path,
            language=language,
            beam_size=beam_size,
            vad_filter=True,  # Voice Activity Detection
            vad_parameters=dict(min_silence_duration_ms=500)
        )
        
        # Convertir a lista de SubtitleSegment
        subtitle_segments = []
        for segment in segments:
            subtitle_segments.append(SubtitleSegment(
                start=segment.start,
                end=segment.end,
                text=segment.text.strip()
            ))
        
        info_dict = {
            'language': info.language,
            'language_probability': info.language_probability,
            'duration': info.duration,
            'segments_count': len(subtitle_segments)
        }
        
        print(f"[✓] Transcription complete: {len(subtitle_segments)} segments")
        
        return subtitle_segments, info_dict
    
    def generate_srt_file(self, segments: List[SubtitleSegment], output_path: str):
        """
        Genera un archivo SRT desde los segmentos.
        
        Args:
            segments: Lista de segmentos de subtítulos
            output_path: Ruta donde guardar el archivo SRT
        """
        with open(output_path, 'w', encoding='utf-8') as f:
            for i, segment in enumerate(segments, start=1):
                f.write(segment.to_srt_format(i))
        
        print(f"[✓] SRT file saved: {output_path}")
    
    def add_subtitles_to_video(
        self,
        video_path: str,
        srt_path: str,
        output_path: str,
        font_size: int = 24,
        font_color: str = "white",
        outline_color: str = "black",
        position: str = "bottom"
    ) -> str:
        """
        Agrega subtítulos a un video usando FFmpeg.
        
        Args:
            video_path: Ruta al video de entrada
            srt_path: Ruta al archivo SRT
            output_path: Ruta del video de salida
            font_size: Tamaño de la fuente
            font_color: Color de la fuente
            outline_color: Color del contorno
            position: Posición (bottom, top, center)
        
        Returns:
            Ruta al video con subtítulos
        """
        import subprocess
        
        # Posiciones verticales
        positions = {
            'bottom': 'h-h*0.15',
            'top': 'h*0.15',
            'center': 'h/2'
        }
        y_position = positions.get(position, positions['bottom'])
        
        # Comando FFmpeg
        cmd = [
            "ffmpeg", "-y",
            "-i", video_path,
            "-vf", f"subtitles={srt_path}:force_style='FontSize={font_size},PrimaryColour=&H{self._color_to_hex(font_color)},OutlineColour=&H{self._color_to_hex(outline_color)},Alignment=2,MarginV=30'",
            "-c:a", "copy",
            output_path
        ]
        
        print(f"[*] Adding subtitles to video...")
        
        try:
            subprocess.run(cmd, check=True, capture_output=True)
            print(f"[✓] Video with subtitles saved: {output_path}")
            return output_path
        except subprocess.CalledProcessError as e:
            print(f"[!] FFmpeg error: {e.stderr.decode()}")
            raise Exception("Failed to add subtitles to video")
    
    def transcribe_and_subtitle_video(
        self,
        video_path: str,
        output_path: Optional[str] = None,
        language: Optional[str] = None,
        **subtitle_kwargs
    ) -> str:
        """
        Pipeline completo: transcribe audio y agrega subtítulos al video.
        
        Args:
            video_path: Ruta al video
            output_path: Ruta del video de salida (opcional)
            language: Idioma para transcripción
            **subtitle_kwargs: Argumentos para personalizar subtítulos
        
        Returns:
            Ruta al video con subtítulos
        """
        # Generar rutas
        base_dir = os.path.dirname(video_path)
        base_name = os.path.splitext(os.path.basename(video_path))[0]
        
        audio_path = os.path.join(base_dir, f"{base_name}_audio.mp3")
        srt_path = os.path.join(base_dir, f"{base_name}.srt")
        
        if output_path is None:
            output_path = os.path.join(base_dir, f"{base_name}_subtitled.mp4")
        
        # 1. Extraer audio del video
        self._extract_audio(video_path, audio_path)
        
        # 2. Transcribir audio
        segments, info = self.transcribe_audio(audio_path, language=language)
        
        # 3. Generar archivo SRT
        self.generate_srt_file(segments, srt_path)
        
        # 4. Agregar subtítulos al video
        result_path = self.add_subtitles_to_video(
            video_path,
            srt_path,
            output_path,
            **subtitle_kwargs
        )
        
        # Limpiar archivos temporales
        if os.path.exists(audio_path):
            os.remove(audio_path)
        
        return result_path
    
    def _extract_audio(self, video_path: str, audio_path: str):
        """Extrae el audio de un video usando FFmpeg."""
        import subprocess
        
        cmd = [
            "ffmpeg", "-y",
            "-i", video_path,
            "-vn",  # No video
            "-acodec", "libmp3lame",
            "-q:a", "2",  # Calidad alta
            audio_path
        ]
        
        subprocess.run(cmd, check=True, capture_output=True)
        print(f"[✓] Audio extracted: {audio_path}")
    
    def _color_to_hex(self, color: str) -> str:
        """Convierte nombre de color a hex para FFmpeg."""
        colors = {
            'white': 'FFFFFF',
            'black': '000000',
            'red': 'FF0000',
            'blue': '0000FF',
            'yellow': 'FFFF00'
        }
        return colors.get(color.lower(), 'FFFFFF')
    
    def offload_to_cpu(self):
        """Mueve el modelo a CPU para liberar VRAM."""
        if self.whisper_model and self.model_loaded:
            try:
                import torch
                if hasattr(self.whisper_model, 'model'):
                    self.whisper_model.model.to('cpu')
                torch.cuda.empty_cache()
                print("[*] Whisper offloaded to CPU")
            except:
                pass

# Singleton instance
_subtitle_service = None

def get_subtitle_service() -> SubtitleService:
    """Obtiene la instancia singleton del servicio de subtítulos."""
    global _subtitle_service
    if _subtitle_service is None:
        _subtitle_service = SubtitleService()
    return _subtitle_service
