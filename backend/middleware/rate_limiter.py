"""
Middleware de Rate Limiting para proteger la API.
Limita el número de requests por IP en una ventana de tiempo.
"""

import time
from collections import defaultdict
from typing import Dict, Tuple
from functools import wraps
from flask import request, jsonify

class RateLimiter:
    def __init__(self):
        # Estructura: {ip: [(timestamp, endpoint), ...]}
        self.requests: Dict[str, list] = defaultdict(list)
        
        # Configuración de límites por endpoint
        self.limits = {
            '/generate-image': (10, 60),      # 10 requests por minuto
            '/face-swap': (5, 60),             # 5 requests por minuto
            '/magic-prompt': (20, 60),         # 20 requests por minuto
            '/render-video': (3, 300),         # 3 requests por 5 minutos
            '/render-multi-scene': (2, 300),   # 2 requests por 5 minutos
            '/enhance-media': (5, 60),         # 5 requests por minuto
            'default': (30, 60)                # 30 requests por minuto (default)
        }
    
    def is_rate_limited(self, ip: str, endpoint: str) -> Tuple[bool, Dict]:
        """
        Verifica si una IP ha excedido el límite de rate.
        
        Args:
            ip: Dirección IP del cliente
            endpoint: Endpoint solicitado
        
        Returns:
            Tupla de (is_limited, info_dict)
        """
        current_time = time.time()
        
        # Obtener límite para este endpoint
        max_requests, window_seconds = self.limits.get(endpoint, self.limits['default'])
        
        # Limpiar requests antiguos
        self.requests[ip] = [
            (ts, ep) for ts, ep in self.requests[ip]
            if current_time - ts < window_seconds
        ]
        
        # Contar requests en la ventana de tiempo para este endpoint
        endpoint_requests = [
            ts for ts, ep in self.requests[ip]
            if ep == endpoint
        ]
        
        # Verificar límite
        if len(endpoint_requests) >= max_requests:
            # Calcular tiempo de espera
            oldest_request = min(endpoint_requests)
            retry_after = int(window_seconds - (current_time - oldest_request))
            
            return True, {
                'limited': True,
                'max_requests': max_requests,
                'window_seconds': window_seconds,
                'retry_after': retry_after,
                'current_count': len(endpoint_requests)
            }
        
        # Registrar este request
        self.requests[ip].append((current_time, endpoint))
        
        return False, {
            'limited': False,
            'max_requests': max_requests,
            'window_seconds': window_seconds,
            'current_count': len(endpoint_requests) + 1,
            'remaining': max_requests - len(endpoint_requests) - 1
        }
    
    def get_client_ip(self) -> str:
        """Obtiene la IP del cliente, considerando proxies."""
        if request.headers.get('X-Forwarded-For'):
            return request.headers.get('X-Forwarded-For').split(',')[0].strip()
        elif request.headers.get('X-Real-IP'):
            return request.headers.get('X-Real-IP')
        else:
            return request.remote_addr or 'unknown'
    
    def cleanup_old_entries(self, max_age_seconds: int = 3600):
        """
        Limpia entradas antiguas para evitar memory leaks.
        
        Args:
            max_age_seconds: Edad máxima de las entradas (default: 1 hora)
        """
        current_time = time.time()
        
        # Limpiar IPs sin requests recientes
        ips_to_remove = []
        for ip, requests in self.requests.items():
            # Filtrar requests antiguos
            recent_requests = [
                (ts, ep) for ts, ep in requests
                if current_time - ts < max_age_seconds
            ]
            
            if not recent_requests:
                ips_to_remove.append(ip)
            else:
                self.requests[ip] = recent_requests
        
        # Remover IPs vacías
        for ip in ips_to_remove:
            del self.requests[ip]
        
        if ips_to_remove:
            print(f"[*] Cleaned up {len(ips_to_remove)} inactive IPs from rate limiter")
    
    def get_stats(self) -> Dict:
        """Obtiene estadísticas del rate limiter."""
        return {
            'active_ips': len(self.requests),
            'total_tracked_requests': sum(len(reqs) for reqs in self.requests.values()),
            'limits': self.limits
        }

# Singleton instance
_rate_limiter = None

def get_rate_limiter() -> RateLimiter:
    """Obtiene la instancia singleton del rate limiter."""
    global _rate_limiter
    if _rate_limiter is None:
        _rate_limiter = RateLimiter()
    return _rate_limiter

def rate_limit(endpoint: str = None):
    """
    Decorador para aplicar rate limiting a un endpoint.
    
    Args:
        endpoint: Nombre del endpoint (usa request.path si no se especifica)
    
    Usage:
        @app.route('/generate-image', methods=['POST'])
        @rate_limit('/generate-image')
        def generate_image():
            ...
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            limiter = get_rate_limiter()
            ip = limiter.get_client_ip()
            path = endpoint or request.path
            
            is_limited, info = limiter.is_rate_limited(ip, path)
            
            if is_limited:
                return jsonify({
                    'status': 'error',
                    'message': 'Rate limit exceeded',
                    'retry_after': info['retry_after'],
                    'limit': f"{info['max_requests']} requests per {info['window_seconds']} seconds"
                }), 429  # Too Many Requests
            
            # Agregar headers de rate limit a la respuesta
            response = f(*args, **kwargs)
            
            if isinstance(response, tuple):
                response_obj, status_code = response[0], response[1] if len(response) > 1 else 200
            else:
                response_obj, status_code = response, 200
            
            # Agregar headers informativos
            if hasattr(response_obj, 'headers'):
                response_obj.headers['X-RateLimit-Limit'] = str(info['max_requests'])
                response_obj.headers['X-RateLimit-Remaining'] = str(info.get('remaining', 0))
                response_obj.headers['X-RateLimit-Window'] = str(info['window_seconds'])
            
            return response_obj, status_code
        
        return decorated_function
    return decorator
