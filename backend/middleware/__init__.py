"""
Middleware de EnfoadsIA.

Este paquete contiene middleware para la aplicación Flask:
- rate_limiter: Rate limiting por endpoint e IP
"""

__all__ = [
    'get_rate_limiter',
    'rate_limit',
]
