# 🔧 Guía de Troubleshooting - Error de Generación de Imágenes

**Fecha**: 2025-12-27  
**Error Detectado**: HTTP 500 en `/generate-image`

---

## 📊 Estado Actual del Sistema

### ✅ Funcionando Correctamente
- ✅ Servidor Flask activo en puerto 5000
- ✅ Ngrok tunnel funcionando: `https://spriggiest-pluggable-roosevelt.ngrok-free.dev`
- ✅ GPU Status endpoint (200 OK)
- ✅ Magic Prompt endpoint (200 OK)
- ✅ SDXL Lightning cargándose correctamente

### ❌ Problema Identificado
- ❌ `/generate-image` retorna 500 Internal Server Error
- ❌ Error ocurre después de cargar SDXL Lightning

---

## 🔍 Posibles Causas del Error

### 1. **Error de VRAM Insuficiente**
**Síntoma**: CUDA Out of Memory
**Solución**: El sistema de offloading debería manejarlo, pero verifica:
```python
# En Colab, ejecuta:
import torch
print(f"VRAM Total: {torch.cuda.get_device_properties(0).total_memory / 1e9:.2f} GB")
print(f"VRAM Usada: {torch.cuda.memory_allocated(0) / 1e9:.2f} GB")
```

### 2. **Error en Carga del Modelo**
**Síntoma**: AttributeError o ModuleNotFoundError
**Solución**: Verificar que todos los archivos del modelo se descargaron correctamente

### 3. **Error en el Prompt**
**Síntoma**: ValueError o TypeError
**Solución**: Ahora validamos que el prompt no esté vacío

### 4. **Error de Tipo de Datos**
**Síntoma**: RuntimeError con tensores
**Solución**: Verificar que torch.float16 sea compatible con la GPU

---

## 🛠️ Mejoras Implementadas

### Cambios en `app.py`

1. **Logging Detallado**:
   ```python
   print(f"[*] Generating image for prompt: {prompt[:50]}...")
   print(f"[*] Running SDXL inference...")
   print(f"[*] Encoding image to base64...")
   print(f"[✓] Image generated successfully")
   ```

2. **Validación de Prompt**:
   ```python
   if not prompt:
       return jsonify({"status": "error", "message": "Prompt vacío"}), 400
   ```

3. **Traceback Completo**:
   ```python
   except Exception as e:
       error_trace = traceback.format_exc()
       print(f"[!] Image Generation Error: {str(e)}")
       print(f"[!] Traceback:\n{error_trace}")
   ```

4. **Tipo de Error en Response**:
   ```python
   return jsonify({
       "status": "error", 
       "message": str(e),
       "type": type(e).__name__  # Nuevo
   }), 500
   ```

---

## 📝 Pasos para Diagnosticar

### Paso 1: Actualizar el Código en Colab

```bash
# En Colab, ejecuta:
%cd /content/FoadsIA
!git pull origin main
```

### Paso 2: Reiniciar el Servidor

```bash
# Detener el servidor actual (Ctrl+C en Colab)
# Luego ejecutar:
%cd /content/FoadsIA/backend
!python app.py
```

### Paso 3: Intentar Generar Imagen Nuevamente

Desde el frontend, intenta generar una imagen y observa los logs en Colab.

### Paso 4: Revisar los Logs

Busca en los logs de Colab:
- `[*] Generating image for prompt: ...` ← Confirma que llegó el request
- `[*] Running SDXL inference...` ← Confirma que el modelo se cargó
- `[!] Image Generation Error: ...` ← Muestra el error específico
- `[!] Traceback:` ← Muestra el stack trace completo

---

## 🚨 Errores Comunes y Soluciones

### Error 1: "CUDA out of memory"
```python
# Solución: Limpiar caché manualmente
import torch
torch.cuda.empty_cache()

# Luego reintentar
```

### Error 2: "No module named 'diffusers'"
```bash
# Solución: Reinstalar dependencias
!pip install -r requirements.txt
```

### Error 3: "AttributeError: 'NoneType' object has no attribute 'to'"
```python
# Solución: El modelo no se cargó correctamente
# Verificar que los archivos se descargaron:
!ls -lh ~/.cache/huggingface/hub/
```

### Error 4: "RuntimeError: Expected all tensors to be on the same device"
```python
# Solución: Problema con offloading
# Modificar load_sdxl_model() para forzar todo a CUDA:
pipe_image.to("cuda")
pipe_image.unet.to("cuda")
pipe_image.vae.to("cuda")
pipe_image.text_encoder.to("cuda")
```

---

## 🔬 Test Manual del Endpoint

### Desde Python (en Colab):

```python
import requests
import json

url = "http://localhost:5000/generate-image"
payload = {
    "prompt": "a beautiful sunset over mountains"
}

response = requests.post(url, json=payload)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")
```

### Desde cURL (en Colab):

```bash
curl -X POST http://localhost:5000/generate-image \
  -H "Content-Type: application/json" \
  -d '{"prompt": "a cat"}'
```

---

## 📊 Checklist de Verificación

Antes de reportar el error, verifica:

- [ ] GPU está disponible (`torch.cuda.is_available()` = True)
- [ ] VRAM suficiente (>8GB libres)
- [ ] Modelo SDXL descargado completamente
- [ ] Dependencias instaladas correctamente
- [ ] Código actualizado con los cambios recientes
- [ ] Logs muestran el error específico

---

## 🎯 Próximos Pasos

1. **Commit y Push** los cambios:
   ```bash
   git add backend/app.py
   git commit -m "fix: Add detailed logging to image generation endpoint"
   git push origin main
   ```

2. **Actualizar Colab** y reiniciar servidor

3. **Intentar generar imagen** y capturar el error específico

4. **Reportar** el error completo con el traceback

---

## 💡 Alternativas si el Error Persiste

### Opción 1: Usar Modelo Más Ligero
```python
# Cambiar a Stable Diffusion 1.5 (más ligero)
base = "runwayml/stable-diffusion-v1-5"
# Requiere ~4GB VRAM vs ~6GB de SDXL
```

### Opción 2: Reducir Resolución
```python
# Agregar parámetros de tamaño
image = pipe(
    prompt, 
    num_inference_steps=4, 
    guidance_scale=0,
    height=512,  # Reducir de 1024
    width=512    # Reducir de 1024
).images[0]
```

### Opción 3: Usar CPU Temporalmente
```python
# Para debugging, cargar modelo en CPU
pipe_image.to("cpu")
# Será MUY lento pero permitirá identificar si es problema de VRAM
```

---

**Documentado por**: Antigravity AI  
**Fecha**: 2025-12-27  
**Versión**: 1.0
