# 📓 Instrucciones para Actualizar el Notebook de Colab

## Nuevas Celdas a Agregar

### Celda 1.5: Pre-descarga de Modelos (Insertar entre Celda 1 y Celda 2)

**Título**: `📥 1.5. Pre-descarga de Modelos (Opcional pero Recomendado)`

**Código**:
```python
# @title 📥 1.5. Pre-descarga de Modelos (Opcional pero Recomendado)

import os
from pathlib import Path

# Ejecutar script de pre-descarga
BACKEND_DIR = Path("/content/FoadsIA/backend")
if BACKEND_DIR.exists():
    os.chdir(BACKEND_DIR)
    !python preload_models.py
else:
    print("⚠️  Ejecuta primero la celda de configuración")
```

**Descripción**: Esta celda ejecuta el script `preload_models.py` que descarga todos los modelos de IA necesarios:
- SDXL Lightning (4-step)
- Faster-Whisper (base)
- InsightFace (buffalo_l)

**Beneficios**:
- ✅ Evita esperas durante la primera generación
- ✅ Verifica que todos los modelos se descarguen correctamente
- ✅ Muestra el espacio en disco utilizado

---

## Mejoras Implementadas en el Backend

### 1. ✅ Endpoint `/magic-prompt`
**Funcionalidad**: Mejora automáticamente los prompts del usuario agregando palabras clave de calidad.

**Ejemplo**:
```
Input:  "a cat"
Output: "masterpiece, best quality, highly detailed, professional photography, 8k uhd, sharp focus, perfect lighting, a cat, vibrant colors, professional composition"
```

**Ventajas**:
- No requiere modelo adicional (ahorra VRAM)
- Basado en reglas simples pero efectivas
- Detecta si es retrato para agregar keywords específicos

### 2. ✅ Endpoint `/face-swap` (Implementación Real)
**Funcionalidad**: Intercambio de rostros usando InsightFace.

**Request**:
```json
{
  "source_image": "data:image/png;base64,...",
  "target_image": "data:image/png;base64,..."
}
```

**Response**:
```json
{
  "status": "success",
  "image": "data:image/png;base64,..."
}
```

**Características**:
- ✅ Detección automática de rostros
- ✅ Soporte para múltiples rostros en imagen objetivo
- ✅ Gestión automática de VRAM
- ✅ Manejo robusto de errores

### 3. ✅ Endpoint `/gpu-status` Mejorado
**Funcionalidad**: Monitoreo detallado de VRAM en tiempo real.

**Response**:
```json
{
  "status": "online",
  "device": "Tesla T4",
  "vram_total_gb": 15.0,
  "vram_allocated_gb": 6.2,
  "vram_reserved_gb": 6.5,
  "vram_free_gb": 8.5,
  "utilization_percent": 43.3,
  "models_loaded": ["sdxl", "whisper"],
  "cuda_version": "11.8"
}
```

**Ventajas**:
- ✅ Información detallada de memoria
- ✅ Lista de modelos cargados
- ✅ Útil para debugging y optimización

---

## Estructura de Archivos Actualizada

```
backend/
├── app.py                          # ✅ Actualizado con nuevos endpoints
├── requirements.txt                # ✅ Sin cambios
├── preload_models.py              # ✨ NUEVO - Pre-descarga de modelos
├── Enfoads_Colab.ipynb            # ⚠️  Requiere actualización manual
└── services/
    ├── __init__.py                # ✨ NUEVO
    └── face_swap_service.py       # ✨ NUEVO - Servicio de Face Swap
```

---

## Checklist de Verificación

### ✅ Completado
- [x] Script de pre-descarga de modelos (`preload_models.py`)
- [x] Endpoint `/magic-prompt` implementado
- [x] Endpoint `/face-swap` con InsightFace
- [x] Endpoint `/gpu-status` mejorado
- [x] Servicio de Face Swap modular
- [x] Documentación completa

### 📝 Pendiente (Actualización Manual del Notebook)
- [ ] Agregar celda 1.5 de pre-descarga en `Enfoads_Colab.ipynb`
- [ ] Actualizar documentación del notebook con nuevas features
- [ ] Probar en Google Colab

---

## Instrucciones para Actualizar el Notebook Manualmente

### Opción 1: Editar en Google Colab
1. Abre `backend/Enfoads_Colab.ipynb` en Google Colab
2. Después de la celda "🛠️ 1. Configuración del Entorno", inserta una nueva celda
3. Copia el código de la Celda 1.5 (ver arriba)
4. Guarda el notebook
5. Descarga el notebook actualizado
6. Reemplaza el archivo local

### Opción 2: Editar el JSON Directamente
1. Abre `backend/Enfoads_Colab.ipynb` en un editor de texto
2. Busca la celda con `"id": "setup"`
3. Después del cierre de esa celda (`}`), agrega la nueva celda
4. Asegúrate de que el JSON sea válido (comas, corchetes, etc.)
5. Guarda el archivo

### Opción 3: Usar el Script de Pre-descarga Directamente
Si no quieres modificar el notebook, puedes agregar esta línea en la Celda 2 (antes de iniciar el servidor):

```python
# Pre-descargar modelos (opcional)
!python preload_models.py
```

---

## Testing en Colab

### 1. Verificar Pre-descarga
```python
# En una celda de Colab
!ls -lh ~/.cache/huggingface/hub/
```

Deberías ver:
- `models--ByteDance--SDXL-Lightning`
- `models--stabilityai--stable-diffusion-xl-base-1.0`
- Otros modelos descargados

### 2. Verificar Endpoints
```python
# Después de iniciar el servidor
import requests

# Test Magic Prompt
response = requests.post(
    f"{public_url}/magic-prompt",
    json={"prompt": "a beautiful sunset"}
)
print(response.json())

# Test GPU Status
response = requests.get(f"{public_url}/gpu-status")
print(response.json())
```

---

## Estimación de Tiempos

### Primera Ejecución (con pre-descarga)
- Configuración del entorno: ~2 minutos
- Pre-descarga de modelos: ~5-10 minutos
- Inicio del servidor: ~30 segundos
- **Total**: ~8-13 minutos

### Ejecuciones Subsecuentes
- Configuración del entorno: ~1 minuto
- Pre-descarga (skip, modelos cacheados): ~10 segundos
- Inicio del servidor: ~30 segundos
- **Total**: ~2 minutos

---

## Troubleshooting

### Problema: "No module named 'services'"
**Solución**: Asegúrate de que el directorio `backend/services/` existe y tiene `__init__.py`

### Problema: "inswapper_128.onnx not found"
**Solución**: El modelo se descargará automáticamente en el primer uso de face-swap

### Problema: "CUDA out of memory"
**Solución**: El sistema de offloading debería manejarlo automáticamente. Si persiste:
```python
# Limpiar VRAM manualmente
import torch
torch.cuda.empty_cache()
```

---

## Próximos Pasos Recomendados

1. **LivePortrait para Videos**: Implementar animación facial realista
2. **Real-ESRGAN**: Upscaling de imágenes 4x
3. **ControlNet**: Control de pose y composición
4. **Sistema de Caché**: Evitar regenerar imágenes idénticas

---

**Actualizado**: 2025-12-27  
**Versión**: 2.0  
**Compatibilidad**: Google Colab T4 GPU
