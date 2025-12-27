# 🚀 Guía de Inicio Rápido - Nuevas Funcionalidades

**Versión**: 3.0  
**Última actualización**: 2025-12-27

---

## 📦 Actualizar el Sistema

### En Google Colab

```bash
# 1. Navegar al directorio
%cd /content/FoadsIA

# 2. Actualizar código
!git pull origin master

# 3. Instalar dependencias (si es necesario)
%cd backend
!pip install -r requirements.txt

# 4. Reiniciar servidor
!python app.py
```

---

## 🎯 Usar las Nuevas Funcionalidades

### 1. Generación de Imágenes con Caché ⚡

```python
import requests

# Primera generación (sin caché) - toma 2-3 segundos
response = requests.post(
    "http://localhost:5000/generate-image",
    json={"prompt": "a beautiful sunset"}
)
print(response.json()['cached'])  # False

# Segunda generación (con caché) - instantáneo
response = requests.post(
    "http://localhost:5000/generate-image",
    json={"prompt": "a beautiful sunset"}
)
print(response.json()['cached'])  # True ⚡
```

### 2. Upscaling de Imágenes 🎨

```python
# Upscale una imagen 4x
response = requests.post(
    "http://localhost:5000/enhance-media",
    json={
        "image": "data:image/png;base64,iVBORw0KG...",  # Tu imagen en base64
        "scale": 4.0,  # Factor de escalado (2.0, 4.0)
        "model": "RealESRGAN_x4plus"  # Modelo a usar
    }
)

upscaled_image = response.json()['image']
print(f"Upscaled {response.json()['scale']}x")
```

### 3. Generar Video con Subtítulos 📝

```python
# Generar video con subtítulos automáticos
response = requests.post(
    "http://localhost:5000/render-video",
    json={
        "avatar_id": "avatar1.jpg",
        "script": "Hola, este es un video de prueba con subtítulos automáticos.",
        "generate_subtitles": True  # ← Activar subtítulos
    }
)

job_id = response.json()['job_id']
print(f"Job ID: {job_id}")

# Monitorear progreso
while True:
    status = requests.get(f"http://localhost:5000/api/jobs/{job_id}")
    data = status.json()
    print(f"Status: {data['status']}")
    
    if data['status'] == 'completed':
        print(f"Video URL: {data['url']}")
        break
    elif data['status'] == 'failed':
        print(f"Error: {data['error']}")
        break
    
    time.sleep(2)
```

### 4. Ver Estadísticas del Sistema 📊

```python
# Ver estado de todos los servicios
response = requests.get("http://localhost:5000/api/services/status")
print(response.json())

# Ver información del sistema
response = requests.get("http://localhost:5000/api/system/info")
info = response.json()
print(f"GPU: {info['gpu']['device']}")
print(f"VRAM Free: {info['gpu']['vram_free_gb']} GB")
print(f"Models Loaded: {info['models_loaded']}")

# Ver estadísticas de caché
response = requests.get("http://localhost:5000/api/cache/stats")
stats = response.json()
print(f"Cache entries: {stats['total_entries']}")
print(f"Cache size: {stats['total_size_mb']} MB")
```

### 5. Limpiar Caché 🧹

```python
# Limpiar entradas de caché más antiguas que 7 días
response = requests.post(
    "http://localhost:5000/api/cache/clear",
    json={"max_age_days": 7}
)
print(response.json()['message'])
```

---

## 🧪 Tests Rápidos desde Terminal

### Test de Caché

```bash
# Primera generación
curl -X POST http://localhost:5000/generate-image \
  -H "Content-Type: application/json" \
  -d '{"prompt": "a cat"}' | jq '.cached'
# Output: false

# Segunda generación (misma prompt)
curl -X POST http://localhost:5000/generate-image \
  -H "Content-Type: application/json" \
  -d '{"prompt": "a cat"}' | jq '.cached'
# Output: true
```

### Test de Rate Limiting

```bash
# Hacer 11 requests rápidos (límite es 10/min)
for i in {1..11}; do
  echo "Request $i:"
  curl -X POST http://localhost:5000/generate-image \
    -H "Content-Type: application/json" \
    -d "{\"prompt\": \"test $i\"}" \
    -w "\nHTTP Status: %{http_code}\n"
  sleep 0.5
done
# Request 11 debería retornar HTTP 429 (Too Many Requests)
```

### Ver Estadísticas

```bash
# Caché
curl http://localhost:5000/api/cache/stats | jq

# Rate Limiting
curl http://localhost:5000/api/rate-limit/stats | jq

# Sistema
curl http://localhost:5000/api/system/info | jq

# Servicios
curl http://localhost:5000/api/services/status | jq
```

---

## 📋 Endpoints Disponibles

### Generación

- `POST /generate-image` - Generar imagen (con caché)
- `POST /magic-prompt` - Mejorar prompt
- `POST /face-swap` - Intercambiar rostros
- `POST /enhance-media` - Upscaling 4x
- `POST /render-video` - Generar video
- `POST /render-multi-scene` - Video multi-escena

### Monitoreo

- `GET /api/services/status` - Estado de servicios
- `GET /api/system/info` - Info del sistema
- `GET /api/cache/stats` - Estadísticas de caché
- `GET /api/rate-limit/stats` - Estadísticas de rate limiting
- `GET /gpu-status` - Estado de GPU

### Gestión

- `POST /api/cache/clear` - Limpiar caché
- `GET /api/assets` - Listar assets
- `POST /api/assets` - Guardar asset
- `GET /api/jobs/:id` - Estado de job

---

## 🔧 Configuración

### Rate Limits (Configurables en `middleware/rate_limiter.py`)

```python
limits = {
    '/generate-image': (10, 60),      # 10 requests/min
    '/face-swap': (5, 60),             # 5 requests/min
    '/magic-prompt': (20, 60),         # 20 requests/min
    '/render-video': (3, 300),         # 3 requests/5min
    '/enhance-media': (5, 60),         # 5 requests/min
}
```

### Caché (Configurables en `services/cache_service.py`)

```python
# Directorio de caché
cache_dir = "data/cache"

# Limpiar entradas más antiguas que X días
cache_service.clear_old_cache(max_age_days=7)
```

---

## 🐛 Troubleshooting

### Error: "Service import warning"

**Solución**: Instalar dependencias faltantes
```bash
pip install realesrgan basicsr faster-whisper
```

### Error: "Cache error (continuing without cache)"

**Solución**: El caché no es crítico, el sistema continúa sin él
```bash
# Opcional: Crear directorio manualmente
mkdir -p data/cache
```

### Error: "Rate limit exceeded"

**Solución**: Esperar el tiempo indicado en `retry_after`
```python
# El error incluye cuánto tiempo esperar
{
  "status": "error",
  "message": "Rate limit exceeded",
  "retry_after": 45  # segundos
}
```

### LivePortrait no disponible

**Solución**: Instalar LivePortrait (opcional)
```bash
cd backend
python setup_liveportrait.py
```

---

## 📚 Documentación Completa

Para más detalles, consulta:

- **`IMPLEMENTATION_COMPLETE.md`** - Documentación completa
- **`SUMMARY.md`** - Resumen ejecutivo
- **`TROUBLESHOOTING.md`** - Guía de troubleshooting
- **`ARCHITECTURE.md`** - Arquitectura del sistema

---

## 💡 Tips

### Optimizar Rendimiento

1. **Usar caché**: Reutilizar prompts cuando sea posible
2. **Monitorear VRAM**: Revisar `/gpu-status` regularmente
3. **Limpiar caché**: Ejecutar `/api/cache/clear` semanalmente

### Mejores Prácticas

1. **Rate limiting**: Respetar los límites para evitar errores 429
2. **Subtítulos**: Activar solo cuando sea necesario (consume VRAM)
3. **Upscaling**: Usar escala 2x para imágenes grandes (más rápido)

---

**¡Listo para usar todas las nuevas funcionalidades!** 🚀

Para soporte, consulta la documentación o abre un issue en GitHub.
