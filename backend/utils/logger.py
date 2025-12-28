import logging
import json
import sys
import os
from datetime import datetime
from logging.handlers import RotatingFileHandler

# Ensure logs directory exists
LOGS_DIR = "logs"
os.makedirs(LOGS_DIR, exist_ok=True)

class StructuredLogger:
    def __init__(self, name="app"):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.INFO)
        self.logger.handlers = [] # Clear existing handlers
        
        # 1. File Handler (JSON format)
        file_handler = RotatingFileHandler(
            os.path.join(LOGS_DIR, "app.log"),
            maxBytes=10*1024*1024, # 10MB
            backupCount=5
        )
        file_handler.setFormatter(JsonFormatter())
        self.logger.addHandler(file_handler)
        
        # 2. Console Handler (Readable format)
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(logging.Formatter(
            '%(asctime)s - [%(levelname)s] - %(message)s'
        ))
        self.logger.addHandler(console_handler)

    def _log(self, level, message, **kwargs):
        """Internal log method with structured data support"""
        extra = kwargs.get('extra', {})
        # Merge kwargs into extra for JSON logging if not specialized args
        for k, v in kwargs.items():
            if k not in ['exc_info', 'stack_info', 'extra']:
                extra[k] = v
        
        self.logger.log(level, message, extra=extra)

    def info(self, message, **kwargs):
        self._log(logging.INFO, message, **kwargs)

    def error(self, message, **kwargs):
        self._log(logging.ERROR, message, **kwargs)

    def warning(self, message, **kwargs):
        self._log(logging.WARNING, message, **kwargs)

    def debug(self, message, **kwargs):
        self._log(logging.DEBUG, message, **kwargs)

class JsonFormatter(logging.Formatter):
    """Format logs as JSON for easier parsing"""
    def format(self, record):
        log_obj = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "module": record.name,
            "message": record.getMessage(),
        }
        
        # Include extra fields
        if hasattr(record, 'args') and isinstance(record.args, dict):
            log_obj.update(record.args)
        
        # Include exception if present
        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)
            
        return json.dumps(log_obj)

# Singleton instance
logger = StructuredLogger("FoadsIA")
