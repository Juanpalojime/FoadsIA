"""
Servicios de EnfoadsIA.

Este paquete contiene todos los servicios de IA y procesamiento:
- cache_service: Sistema de caché de imágenes
- upscale_service: Upscaling con Real-ESRGAN
- liveportrait_service: Animación facial con LivePortrait
- subtitle_service: Subtítulos automáticos con Faster-Whisper
- face_swap_service: Intercambio de rostros con InsightFace
"""

__all__ = [
    'get_cache_service',
    'get_esrgan_service',
    'get_liveportrait_service',
    'get_subtitle_service',
    'get_face_swap_service',
]
