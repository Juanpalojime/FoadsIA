import os
import sys
import time
import json
import threading
import queue
import glob
import subprocess
import asyncio
import shutil
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from pyngrok import ngrok
try:
    import edge_tts
except ImportError:
    print("Instance warm-up: edge-tts not found yet")

# Import custom services
try:
    from services.cache_service import get_cache_service
    from services.upscale_service import get_esrgan_service
    from services.liveportrait_service import get_liveportrait_service
    from services.subtitle_service import get_subtitle_service
    from middleware.rate_limiter import get_rate_limiter, rate_limit
except ImportError as e:
    print(f"[!] Service import warning: {e}")
    print("[!] Some features may not be available")

# Initialize Flask App & SocketIO
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Static File Serving
@app.route('/files/<path:filename>')
def serve_files(filename):
    return send_from_directory('data', filename)

# Global Error Handlers
@app.errorhandler(404)
def not_found(e):
    return jsonify({"status": "error", "message": "Endpoint no encontrado"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"status": "error", "message": "Error interno del servidor", "details": str(e)}), 500

@app.errorhandler(Exception)
def handle_exception(e):
    print(f"[!] Unhandled Exception: {str(e)}")
    return jsonify({"status": "error", "message": "Ocurrió un error inesperado", "error": str(e)}), 500

# Global State & Persistence
DATA_DIR = "data"
os.makedirs(DATA_DIR, exist_ok=True)
ASSETS_FILE = os.path.join(DATA_DIR, "assets.json")
BASE_URL = os.environ.get("BASE_URL", "") # Store public base URL for threads

def load_json(path, default):
    if not os.path.exists(path):
        with open(path, 'w') as f: json.dump(default, f)
    with open(path, 'r') as f: return json.load(f)

def save_json(path, data):
    with open(path, 'w') as f: json.dump(data, f, indent=4)

# Initial Load
assets_db = load_json(ASSETS_FILE, [])

# Job Queue
job_queue = queue.Queue()
jobs_status = {}

# VRAM Manager (T4 Optimization)
loaded_models = {}

def offload_models(except_model=None):
    """Offloads all models to CPU to free up VRAM for the next task."""
    import torch
    global loaded_models
    for name, model in loaded_models.items():
        if name != except_model and model is not None:
            print(f"[*] Offloading {name} to CPU...")
            try:
                model.to("cpu")
            except: pass
    torch.cuda.empty_cache()

# Global Models
pipe_image = None
whisper_model = None
# LivePortrait/SadTalker usually carry multiple sub-models

# Background Worker Utilities
def transcribe_and_subtitle(video_path, audio_path):
    """Real implementation using faster-whisper and moviepy."""
    global whisper_model, loaded_models
    try:
        from faster_whisper import WhisperModel
        from moviepy.editor import VideoFileClip, TextClip, CompositeVideoClip
        
        if whisper_model is None:
            print("[*] Loading Whisper model to RAM...")
            whisper_model = WhisperModel("base", device="cpu", compute_type="float16")
            loaded_models['whisper'] = whisper_model

        offload_models(except_model='whisper')
        # Faster-whisper handles its own device management usually, 
        # but we can force it if needed. For now we use the object.
        whisper_model.model.to("cuda") 
        
        print("[*] Transcribing audio...")
        segments, info = whisper_model.transcribe(audio_path, beam_size=5)
        
        video = VideoFileClip(video_path)
        clips = [video]
        
        print("[*] Creating subtitle clips...")
        for segment in segments:
            txt_clip = TextClip(
                segment.text, 
                fontsize=40, 
                color='white', 
                font='Arial-Bold',
                stroke_color='black',
                stroke_width=1,
                method='caption',
                size=(video.w * 0.8, None)
            ).set_start(segment.start).set_end(segment.end).set_position(('center', video.h * 0.8))
            clips.append(txt_clip)
            
        result = CompositeVideoClip(clips)
        output_path = video_path.replace(".mp4", "_subtitled.mp4")
        result.write_videofile(output_path, codec="libx264", audio_codec="aac")
        return output_path
    except Exception as e:
        print(f"[!] Subtitling failed: {str(e)}")
        return video_path
# Helper: TTS Sync Wrapper
async def _poly_tts(text, voice, out_file):
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(out_file)

def run_tts_sync(text, out_file, voice="es-MX-DaliaNeural"):
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(_poly_tts(text, voice, out_file))
        loop.close()
        return True
    except Exception as e:
        print(f"TTS Failed: {e}")
        return False

def background_worker():
    while True:
        job = job_queue.get()
        if job is None: break
        
        job_id = job['id']
        jobs_status[job_id]['status'] = 'processing'
        socketio.emit('job_update', {"job_id": job_id, "status": "processing", "progress": 5})
        
        try:
            print(f"[*] Processing Job {job_id}: {job['type']}")
            work_dir = os.path.join(DATA_DIR, "jobs", job_id)
            os.makedirs(work_dir, exist_ok=True)
            
            # Base URL for results
            # Accessing app context inside thread is tricky for request.url_root
            # We assume standard localhost or ngrok, ideally passed in job or config
            # For simplicity, we construct relative to /files/
            
            if job['type'] == 'video':
                data = job['data']
                avatar_id = data.get('avatar_id')
                script = data.get('script')
                
                # 1. TTS Generation
                socketio.emit('job_update', {"job_id": job_id, "status": "processing", "progress": 15, "message": "Generando voz neuronal..."})
                audio_path = os.path.join(work_dir, "audio.mp3")
                
                if script:
                    if not run_tts_sync(script, audio_path):
                        raise Exception("TTS Generation Failed")
                
                # 2. Animation (LivePortrait via Subprocess)
                socketio.emit('job_update', {"job_id": job_id, "status": "processing", "progress": 30, "message": "Animando rostro (LivePortrait)..."})
                
                # Resolve avatar path
                avatar_path = os.path.join(DATA_DIR, "avatars", avatar_id) if avatar_id else None
                if not avatar_path or not os.path.exists(avatar_path):
                    # Fallback to a default if ID provided is not a file
                    avatar_path = os.path.join(DATA_DIR, "avatars", "default.jpg") # Ensure this exists
                
                if not os.path.exists("LivePortrait"):
                    print("[!] LivePortrait repo not found. Skipping animation.")
                    # Fallback so job doesn't crash completely for user without setup
                    video_path = os.path.join(work_dir, "result.mp4")
                    # Create dummy video from image to prevent 404
                    # (requires FFmpeg)
                    subprocess.run(f"ffmpeg -loop 1 -i {avatar_path} -i {audio_path} -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest {video_path}", shell=True)
                else:
                    # Execute LivePortrait inference
                    # Assuming standard structure
                    cmd = [
                        "python", "LivePortrait/inference.py",
                        "--source", avatar_path,
                        "--driving", audio_path,
                        "--output_dir", work_dir
                    ]
                    subprocess.run(cmd, check=True)
                    # Find output video (LivePortrait names vary)
                    # ... usually inside work_dir/animation.mp4
                    video_path = os.path.join(work_dir, "result.mp4") # Rename logic needed in real setup

                # 3. Subtitles (Whisper)
                if data.get('generate_subtitles'):
                    socketio.emit('job_update', {"job_id": job_id, "status": "processing", "progress": 80, "message": "Sincronizando subtítulos..."})
                    final_path = transcribe_and_subtitle(video_path, audio_path)
                    video_path = final_path

                # Finalize
                # Find the result video. LivePortrait creates a subdir like work_dir/animations/result.mp4
                found_videos = glob.glob(os.path.join(work_dir, "**", "*.mp4"), recursive=True)
                if found_videos:
                    # Sort by modification time to get the latest
                    found_videos.sort(key=os.path.getmtime, reverse=True)
                    video_path = found_videos[0]
                
                result_filename = os.path.basename(video_path)
                # Ensure the file is in a predictable place for serving
                predictable_path = os.path.join(work_dir, "final_result.mp4")
                if video_path != predictable_path:
                    shutil.copy2(video_path, predictable_path)
                
                public_path = f"{BASE_URL}/files/jobs/{job_id}/final_result.mp4"
                jobs_status[job_id]['url'] = public_path
                jobs_status[job_id]['status'] = 'completed'
                socketio.emit('job_update', {"job_id": job_id, "status": "completed", "progress": 100, "url": public_path})

            elif job['type'] == 'live_portrait':
                 # Specific endpoint logic job
                 pass

        except Exception as e:
            print(f"[!] Job {job_id} Failed: {str(e)}")
            jobs_status[job_id]['status'] = 'failed'
            jobs_status[job_id]['error'] = str(e)
            socketio.emit('job_update', {"job_id": job_id, "status": "failed", "error": str(e)})
        
        job_queue.task_done()

# Start Worker Thread
worker_thread = threading.Thread(target=background_worker, daemon=True)
worker_thread.start()

@app.route('/', methods=['GET'])
def health_check():
    global BASE_URL
    if not BASE_URL:
        BASE_URL = request.url_root.rstrip('/')
    return jsonify({
        "status": "online", 
        "mode": "free_oss",
        "optimization": "T4_VRAM_MANAGER",
        "base_url": BASE_URL
    })

@app.route('/api/assets', methods=['GET', 'POST'])
def manage_assets():
    global assets_db
    if request.method == 'POST':
        asset = request.json
        assets_db.append(asset)
        save_json(ASSETS_FILE, assets_db)
        return jsonify({"status": "success", "assets_count": len(assets_db)})
    return jsonify({"status": "success", "assets": assets_db})

# Job Status Polling
@app.route('/api/jobs/<job_id>', methods=['GET'])
def get_job_status(job_id):
    job = jobs_status.get(job_id)
    if not job:
        return jsonify({"status": "error", "message": "Job not found"}), 404
    return jsonify(job)

@app.route('/render-video', methods=['POST'])
def render_video():
    try:
        data = request.json
        job_id = f"vid_{int(time.time())}"
        
        # Add to Queue
        jobs_status[job_id] = {
            "id": job_id,
            "status": "queued",
            "type": "video",
            "created_at": time.time()
        }
        
        job_queue.put({"id": job_id, "type": "video", "data": data})
        
        return jsonify({
            "status": "success",
            "job_id": job_id,
            "message": "Renderizado en cola de producción"
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/render-multi-scene', methods=['POST'])
def render_multi_scene():
    try:
        data = request.json
        scenes = data.get('scenes', [])
        job_id = f"multi_{int(time.time())}"
        
        jobs_status[job_id] = {
            "id": job_id,
            "status": "queued",
            "type": "multi_scene",
            "scenes_count": len(scenes),
            "created_at": time.time()
        }
        
        job_queue.put({"id": job_id, "type": "multi_scene", "data": data})
        
        return jsonify({
            "status": "success",
            "job_id": job_id,
            "message": "Proyecto Multi-Escena en cola"
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# Existing SDXL / FaceSwap logic refined for production
def load_sdxl_model():
    global pipe_image, loaded_models
    import torch
    
    if pipe_image is None:
        from diffusers import StableDiffusionXLPipeline, UNet2DConditionModel, EulerAncestralDiscreteScheduler
        from huggingface_hub import hf_hub_download

        base = "stabilityai/stable-diffusion-xl-base-1.0"
        repo = "ByteDance/SDXL-Lightning"
        ckpt = "sdxl_lightning_4step_unet.safetensors"

        print("Loading SDXL Lightning to RAM...")
        unet = UNet2DConditionModel.from_config(base, subfolder="unet")
        unet.load_state_dict(torch.load(hf_hub_download(repo, ckpt), map_location="cpu", weights_only=False))
        pipe_image = StableDiffusionXLPipeline.from_pretrained(base, unet=unet, torch_dtype=torch.float16, variant="fp16")
        pipe_image.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe_image.scheduler.config, timestep_spacing="trailing")
        loaded_models['sdxl'] = pipe_image
        print("SDXL Lightning Ready in RAM.")
    
    offload_models(except_model='sdxl')
    pipe_image.to("cuda")
    return pipe_image

@app.route('/magic-prompt', methods=['POST'])
def magic_prompt():
    """Enhance user prompts with quality keywords and artistic style."""
    try:
        data = request.json
        prompt = data.get('prompt', '').strip()
        
        if not prompt:
            return jsonify({"status": "error", "message": "Prompt vacío"}), 400
        
        # Rule-based enhancement (no model needed, saves VRAM)
        quality_keywords = "masterpiece, best quality, highly detailed, professional photography, 8k uhd, sharp focus, perfect lighting"
        
        # Detect if it's a portrait/person
        person_keywords = ['person', 'man', 'woman', 'portrait', 'face', 'people', 'human']
        is_portrait = any(kw in prompt.lower() for kw in person_keywords)
        
        if is_portrait:
            enhanced = f"{quality_keywords}, beautiful detailed eyes, detailed face, {prompt}, cinematic lighting, bokeh background"
        else:
            enhanced = f"{quality_keywords}, {prompt}, vibrant colors, professional composition"
        
        return jsonify({
            "status": "success", 
            "prompt": enhanced,
            "original": prompt
        })
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/face-swap', methods=['POST'])
def face_swap():
    """Intercambia rostros entre dos imágenes usando InsightFace."""
    import torch
    if not torch.cuda.is_available():
        return jsonify({"status": "error", "message": "GPU no disponible en el servidor"}), 503
    
    try:
        data = request.json
        source_image = data.get('source_image')
        target_image = data.get('target_image')
        
        if not source_image or not target_image:
            return jsonify({
                "status": "error", 
                "message": "Se requieren source_image y target_image en base64"
            }), 400
        
        # Importar servicio
        from services.face_swap_service import get_face_swap_service
        
        # Offload otros modelos para liberar VRAM
        offload_models(except_model='faceswap')
        
        # Obtener servicio y procesar
        service = get_face_swap_service()
        result_image = service.process_base64(source_image, target_image)
        
        # Registrar en loaded_models para tracking
        loaded_models['faceswap'] = service
        
        return jsonify({
            "status": "success", 
            "image": result_image
        })
        
    except Exception as e:
        print(f"[!] Face Swap Error: {e}")
        return jsonify({
            "status": "error", 
            "message": str(e)
        }), 500

@app.route('/generate-image', methods=['POST'])
@rate_limit('/generate-image')
def generate_image():
    import torch
    import traceback
    
    if not torch.cuda.is_available():
        return jsonify({"status": "error", "message": "GPU no disponible en el servidor"}), 503
    
    try:
        data = request.json
        prompt = data.get('prompt')
        steps = data.get('steps', 4)
        guidance = data.get('guidance_scale', 0)
        
        if not prompt:
            return jsonify({"status": "error", "message": "Prompt vacío o no proporcionado"}), 400
        
        print(f"[*] Generating image for prompt: {prompt[:50]}...")
        
        # Intentar obtener del caché
        try:
            cache_service = get_cache_service()
            cache_key = cache_service.get_cache_key(prompt, steps, guidance)
            cached_image = cache_service.get_cached_image(cache_key)
            
            if cached_image:
                import base64
                img_str = base64.b64encode(cached_image).decode('utf-8')
                return jsonify({
                    "status": "success", 
                    "image": f"data:image/png;base64,{img_str}",
                    "cached": True
                })
        except Exception as cache_error:
            print(f"[!] Cache error (continuing without cache): {cache_error}")
        
        # Generar imagen
        pipe = load_sdxl_model()
        
        print(f"[*] Running SDXL inference...")
        image = pipe(prompt, num_inference_steps=steps, guidance_scale=guidance).images[0]
        
        print(f"[*] Encoding image to base64...")
        import io, base64
        buffered = io.BytesIO()
        image.save(buffered, format="PNG")
        image_bytes = buffered.getvalue()
        img_str = base64.b64encode(image_bytes).decode('utf-8')
        
        # Guardar en caché
        try:
            cache_service.save_to_cache(
                cache_key, 
                image_bytes,
                metadata={'prompt': prompt, 'steps': steps, 'guidance': guidance}
            )
        except Exception as cache_error:
            print(f"[!] Failed to save to cache: {cache_error}")
        
        print(f"[✓] Image generated successfully")
        return jsonify({
            "status": "success", 
            "image": f"data:image/png;base64,{img_str}",
            "cached": False
        })
        
    except Exception as e:
        error_trace = traceback.format_exc()
        print(f"[!] Image Generation Error: {str(e)}")
        print(f"[!] Traceback:\n{error_trace}")
        return jsonify({
            "status": "error", 
            "message": str(e),
            "type": type(e).__name__
        }), 500

@app.route('/gpu-status', methods=['GET'])
def gpu_status():
    """Enhanced GPU status with detailed VRAM monitoring."""
    try:
        import torch
        if torch.cuda.is_available():
            total = torch.cuda.get_device_properties(0).total_memory / 1e9
            allocated = torch.cuda.memory_allocated(0) / 1e9
            reserved = torch.cuda.memory_reserved(0) / 1e9
            free = total - reserved
            
            return jsonify({
                "status": "online",
                "device": torch.cuda.get_device_name(0),
                "vram_total_gb": round(total, 2),
                "vram_allocated_gb": round(allocated, 2),
                "vram_reserved_gb": round(reserved, 2),
                "vram_free_gb": round(free, 2),
                "utilization_percent": round((reserved / total) * 100, 1),
                "models_loaded": list(loaded_models.keys()),
                "cuda_version": torch.version.cuda
            })
    except Exception as e:
        print(f"[!] GPU Status Error: {e}")
    
    return jsonify({"status": "offline", "message": "GPU no disponible"})


@app.route('/avatars', methods=['GET'])
def get_avatars():
    avatar_dir = os.path.join(DATA_DIR, "avatars")
    os.makedirs(avatar_dir, exist_ok=True)
    
    files = glob.glob(os.path.join(avatar_dir, "*.*"))
    avatars = []
    
    # Detect base URL dynamically (ngrok compatible)
    base_url = request.url_root.rstrip('/')
    
    for f in files:
        fname = os.path.basename(f)
        if fname.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
             avatars.append({
                "id": fname,
                "name": fname.split('.')[0].replace('_', ' ').title(),
                "img": f"{base_url}/files/avatars/{fname}"
             })
             
    # Fallback if empty
    if not avatars:
        avatars = [
            { "id": "demo_1", "name": "Demo User", "img": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400" }
        ]
        
    return jsonify({ "status": "success", "avatars": avatars })

@app.route('/live-portrait', methods=['POST'])
def live_portrait():
    """Endpoint simplificado para LivePortrait."""
    try:
        data = request.json
        # Encolar trabajo de animación
        job_id = f"lp_{int(time.time())}"
        jobs_status[job_id] = { 
            "id": job_id, 
            "status": "queued", 
            "type": "video",  # Reusamos la lógica de video del worker
            "created_at": time.time()
        }
        
        # Adaptar datos para el worker de video
        job_data = {
            "avatar_id": data.get("image"), # Asumimos que mandan ID o path
            "script": data.get("audio"), # O audio path
            "generate_subtitles": False
        }
        
        job_queue.put({"id": job_id, "type": "video", "data": job_data})
        
        return jsonify({ "status": "processing", "job_id": job_id, "message": "Animación en cola" })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/enhance-media', methods=['POST'])
@rate_limit('/enhance-media')
def enhance_media():
    """Upscaling con RealESRGAN."""
    import traceback
    
    try:
        data = request.json
        image_data = data.get('image')  # Base64 image
        scale = data.get('scale', 4.0)  # Upscale factor
        model_name = data.get('model', 'RealESRGAN_x4plus')
        
        if not image_data:
            return jsonify({
                "status": "error",
                "message": "No image provided"
            }), 400
        
        print(f"[*] Upscaling image with scale {scale}x...")
        
        # Obtener servicio de upscaling
        from services.esrgan_service import get_esrgan_service
        esrgan_service = get_esrgan_service()
        
        # Offload otros modelos
        offload_models(except_model='esrgan')
        
        # Upscale la imagen
        upscaled_image = esrgan_service.upscale_from_base64(image_data, outscale=scale)
        
        # Registrar en loaded_models
        loaded_models['esrgan'] = esrgan_service
        
        print(f"[✓] Image upscaled successfully")
        
        return jsonify({
            "status": "success",
            "image": upscaled_image,
            "scale": scale,
            "model": model_name
        })
        
    except Exception as e:
        error_trace = traceback.format_exc()
        print(f"[!] Upscaling Error: {str(e)}")
        print(f"[!] Traceback:\n{error_trace}")
        return jsonify({
            "status": "error",
            "message": str(e),
            "type": type(e).__name__
        }), 500

# ============================================================
# MONITORING & STATS ENDPOINTS
# ============================================================

@app.route('/api/cache/stats', methods=['GET'])
def cache_stats():
    """Obtiene estadísticas del sistema de caché."""
    try:
        cache_service = get_cache_service()
        stats = cache_service.get_cache_stats()
        return jsonify({
            "status": "success",
            **stats
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/cache/clear', methods=['POST'])
def clear_cache():
    """Limpia el caché de imágenes."""
    try:
        data = request.json or {}
        max_age_days = data.get('max_age_days', 7)
        
        cache_service = get_cache_service()
        cache_service.clear_old_cache(max_age_days)
        
        return jsonify({
            "status": "success",
            "message": f"Cache cleared (entries older than {max_age_days} days)"
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/rate-limit/stats', methods=['GET'])
def rate_limit_stats():
    """Obtiene estadísticas del rate limiter."""
    try:
        limiter = get_rate_limiter()
        stats = limiter.get_stats()
        return jsonify({
            "status": "success",
            **stats
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/services/status', methods=['GET'])
def services_status():
    """Obtiene el estado de todos los servicios."""
    try:
        import torch
        
        status = {
            "gpu": {
                "available": torch.cuda.is_available(),
                "device": torch.cuda.get_device_name(0) if torch.cuda.is_available() else None
            },
            "services": {
                "cache": True,  # Siempre disponible
                "rate_limiter": True,  # Siempre disponible
            }
        }
        
        # Check LivePortrait
        try:
            lp_service = get_liveportrait_service()
            status["services"]["liveportrait"] = lp_service.get_status()
        except:
            status["services"]["liveportrait"] = {"available": False}
        
        # Check Real-ESRGAN
        try:
            esrgan_service = get_esrgan_service()
            status["services"]["esrgan"] = {"available": True}
        except:
            status["services"]["esrgan"] = {"available": False}
        
        # Check Whisper
        try:
            subtitle_service = get_subtitle_service()
            status["services"]["whisper"] = {"available": True}
        except:
            status["services"]["whisper"] = {"available": False}
        
        return jsonify({
            "status": "success",
            **status
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/system/info', methods=['GET'])
def system_info():
    """Obtiene información completa del sistema."""
    try:
        import torch
        import platform
        
        info = {
            "system": {
                "platform": platform.system(),
                "python_version": platform.python_version(),
            },
            "gpu": {},
            "models_loaded": list(loaded_models.keys()),
            "jobs": {
                "total": len(jobs_status),
                "queued": sum(1 for j in jobs_status.values() if j['status'] == 'queued'),
                "processing": sum(1 for j in jobs_status.values() if j['status'] == 'processing'),
                "completed": sum(1 for j in jobs_status.values() if j['status'] == 'completed'),
                "failed": sum(1 for j in jobs_status.values() if j['status'] == 'failed'),
            }
        }
        
        if torch.cuda.is_available():
            info["gpu"] = {
                "available": True,
                "device": torch.cuda.get_device_name(0),
                "vram_total_gb": round(torch.cuda.get_device_properties(0).total_memory / 1e9, 2),
                "vram_allocated_gb": round(torch.cuda.memory_allocated(0) / 1e9, 2),
                "vram_free_gb": round((torch.cuda.get_device_properties(0).total_memory - torch.cuda.memory_reserved(0)) / 1e9, 2),
            }
        else:
            info["gpu"] = {"available": False}
        
        return jsonify({
            "status": "success",
            **info
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 SERVIDOR FLASK INICIADO EN PUERTO 5000")
    print("="*60 + "\n")
    
    try:
        # Ejecutamos Flask con SocketIO
        socketio.run(app, host='0.0.0.0', port=5000, debug=False, allow_unsafe_werkzeug=True)
    except KeyboardInterrupt:
        print("\n\n🛑 Servidor detenido por el usuario")
    except Exception as e:
        print(f"\n❌ Error al iniciar servidor: {e}")

