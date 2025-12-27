# 🚀 EnfoadsIA - Plataforma de Generación de Contenido con IA

EnfoadsIA es una plataforma completa para generar imágenes y videos usando modelos de IA avanzados, optimizada para ejecutarse en Google Colab con GPU T4.

## 🎯 Características

- **Generación de Imágenes**: SDXL Lightning (4 pasos, ultra-rápido)
- **Magic Prompt**: Mejora automática de prompts con IA
- **Face Swap**: Intercambio de rostros usando InsightFace
- **Generación de Videos**: Avatares con voz y subtítulos automáticos
- **Multi-Escena**: Creación de videos comerciales con múltiples escenas
- **Biblioteca de Assets**: Gestión de contenido generado
- **Monitoreo GPU**: Dashboard en tiempo real de uso de VRAM
- **Optimización VRAM**: Gestión inteligente de memoria para GPU T4
- **Pre-descarga de Modelos**: Sistema automático de caché


## 📁 Estructura del Proyecto

```
FoadsIA/
├── backend/              # Servidor Flask + SocketIO
│   ├── app.py           # API principal
│   ├── requirements.txt # Dependencias Python
│   ├── test_app.py      # Tests del backend
│   └── Enfoads_Colab.ipynb  # Notebook para Google Colab
├── src/                 # Frontend React + TypeScript
│   ├── pages/          # Páginas de la aplicación
│   ├── components/     # Componentes reutilizables
│   ├── services/       # API client y servicios
│   └── styles/         # CSS y variables de diseño
└── public/             # Assets estáticos
```

## 🚀 Inicio Rápido

### Opción 1: Desarrollo Local (Frontend)

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Ejecutar tests
npx vitest run
```

### Opción 2: Backend en Google Colab (Recomendado)

1. **Abre el notebook**: 
   - **v2.0 (Recomendado)**: `backend/Enfoads_Colab_v2.ipynb` 
   - **v1.0 (Original)**: `backend/Enfoads_Colab.ipynb`
2. **Configura GPU**: Runtime → Change runtime type → GPU (T4)
3. **Ejecuta las celdas** en orden:
   - Celda 1: Instala dependencias y clona el repositorio
   - Celda 1.5 (Solo v2.0): Pre-descarga modelos para evitar esperas
   - Celda 2: Configura tu token de Ngrok e inicia el servidor
   - Celda 3 (Opcional): Diagnóstico del sistema
4. **Copia la URL de Ngrok** que aparece en la salida
5. **Configura el frontend**: Ve a Settings y pega la URL

**💡 Tip**: Usa el notebook v2.0 y ejecuta la celda 1.5 de pre-descarga para ahorrar 5-10 minutos en la primera generación.


### Opción 3: Backend Local (Desarrollo)

```bash
cd backend
pip install -r requirements.txt
python app.py
```

## 🔧 Configuración

### Variables de Entorno

El frontend usa `localStorage` para guardar la configuración:
- `FOADS_API_URL`: URL del backend (ej: `https://xxxx.ngrok-free.app`)

### Ngrok Token

Para usar Ngrok en Colab, necesitas un token gratuito:
1. Regístrate en [ngrok.com](https://ngrok.com)
2. Copia tu authtoken desde [dashboard.ngrok.com](https://dashboard.ngrok.com/get-started/your-authtoken)
3. Pégalo en la Celda 2 del notebook de Colab

## 🧪 Testing

### Frontend
```bash
npx vitest run              # Ejecutar todos los tests
npx vitest run --coverage   # Con cobertura
```

### Backend
```bash
cd backend
pytest test_app.py -v
```

## 📦 Dependencias Principales

### Frontend
- React 19 + TypeScript
- Vite (build tool)
- React Router (navegación)
- Zustand (state management)
- Socket.IO Client (tiempo real)
- Lucide React (iconos)

### Backend
- Flask + Flask-SocketIO
- PyTorch + Diffusers (SDXL)
- Faster-Whisper (transcripción)
- MoviePy (edición de video)
- Pyngrok (túnel público)
- InsightFace (face swap)

## 🎨 Características del Frontend

- **Diseño Moderno**: Glassmorphism, gradientes, animaciones
- **Responsive**: Adaptado a móviles y tablets
- **Error Boundary**: Manejo robusto de errores
- **Estado Global**: Gestión de créditos y assets
- **Testing**: Cobertura de componentes críticos

## 🔒 Seguridad

- CORS configurado para desarrollo
- Validación de inputs en backend
- Error handlers globales
- Sanitización de URLs

## 📝 Licencia

Este proyecto es de código abierto para uso educativo y personal.

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:
1. Fork el repositorio
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📧 Soporte

Para problemas o preguntas, abre un issue en GitHub.

---

**Desarrollado con ❤️ usando React, Flask y modelos de IA de última generación**
