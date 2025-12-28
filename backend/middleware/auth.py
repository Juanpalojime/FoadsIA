from functools import wraps
from flask import request, jsonify
import jwt
import os

# Configuration
SECRET_KEY = os.environ.get('JWT_SECRET', 'dev-secret-key-change-in-prod')
ALGORITHM = "HS256"

def require_auth(f):
    """
    Decorator to protect routes with JWT authentication.
    Expects Authorization: Bearer <token> header.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        # Allow OPTIONS for CORS
        if request.method == 'OPTIONS':
            return f(*args, **kwargs)

        # Get token from header
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({
                "status": "error",
                "message": "Authorization header is missing",
                "code": "auth_missing"
            }), 401
        
        try:
            # Check format "Bearer <token>"
            parts = auth_header.split()
            if parts[0].lower() != "bearer":
                raise ValueError("Invalid header format")
            
            token = parts[1]
            
            # Decode token
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            
            # Attach user info to request
            request.user = payload
            
        except jwt.ExpiredSignatureError:
            return jsonify({
                "status": "error",
                "message": "Token has expired",
                "code": "auth_expired"
            }), 401
        except (jwt.InvalidTokenError, ValueError) as e:
            return jsonify({
                "status": "error",
                "message": "Invalid token",
                "code": "auth_invalid"
            }), 401
            
        return f(*args, **kwargs)
        
    return decorated

def generate_token(user_id, expiration_minutes=60*24):
    """Helper to generate tokens (e.g. for login endpoint or dev testing)"""
    import datetime
    
    payload = {
        'sub': user_id,
        'iat': datetime.datetime.utcnow(),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=expiration_minutes)
    }
    
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
