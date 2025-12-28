import os
import sys
import huggingface_hub
# Monkeypatch for legacy libraries that still use cached_download
if not hasattr(huggingface_hub, 'cached_download'):
    from huggingface_hub import hf_hub_download
    huggingface_hub.cached_download = hf_hub_download
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
    from services.style_service import get_style_service
    from middleware.rate_limiter import get_rate_limiter, rate_limit
    from middleware.auth import require_auth, generate_token
    from utils.logger import logger
except ImportError as e:
    print(f"[!] Service import warning: {e}")
    print("[!] Some features may not be available")
    # Fallback logger if not imported
    class MockLogger:
        def info(self, msg, **kwargs): print(f"[INFO] {msg}")
        def error(self, msg, **kwargs): print(f"[ERROR] {msg}")
        def warning(self, msg, **kwargs): print(f"[WARN] {msg}")
    logger = MockLogger()
    def require_auth(f): return f
    def generate_token(*args, **kwargs): return "mock-token"

# Initialize Flask App & SocketIO
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Static File Serving
@app.route('/files/<path:filename>')
def serve_files(filename):
    return send_from_directory('data', filename)

@app.route('/', methods=['GET'])
def health_check():
    """Health check endpoint for frontend connection verification."""
    global BASE_URL
    if not BASE_URL:
        BASE_URL = request.url_root.rstrip('/')
    return jsonify({
        "status": "online", 
        "message": "FoadsIA Backend Running",
        "mode": "free_oss",
        "optimization": "T4_VRAM_MANAGER",
        "base_url": BASE_URL
    })

# Global Error Handlers
@app.errorhandler(404)
def not_found(e):
    return jsonify({"status": "error", "message": "Endpoint no encontrado"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"status": "error", "message": "Error interno del servidor", "details": str(e)}), 500

@app.errorhandler(Exception)
def handle_exception(e):
    logger.error(f"Unhandled Exception: {str(e)}", exc_info=True)
    return jsonify({"status": "error", "message": "Ocurrió un error inesperado", "error": str(e)}), 500

@app.route('/auth/login', methods=['POST'])
def login():
    """Endpoint temporal para obtener token (en prod usaría DB)."""
    data = request.json or {}
    username = data.get('username', 'demo')
    # password check placeholder
    
    token = generate_token(username)
    return jsonify({
        "status": "success",
        "token": token,
        "type": "Bearer"
    })

# Global State & Persistence
DATA_DIR = "data"
os.makedirs(DATA_DIR, exist_ok=True)
ASSETS_FILE = os.path.join(DATA_DIR, "assets.json")
BASE_URL = os.environ.get("BASE_URL", "")

def load_json(path, default):
    if not os.path.exists(path):
        with open(path, 'w') as f: json.dump(default, f)
    with open(path, 'r') as f: return json.load(f)

def save_json(path, data):
    with open(path, 'w') as f: json.dump(data, f, indent=4)

# Initial Load
assets_db = load_json(ASSETS_FILE, [])

def verify_file_integrity(file_path, min_size_mb=100):
    """Verificar que un archivo de modelo existe y tiene un tamaño razonable"""
    if not os.path.exists(file_path):
        return False
    file_size_mb = os.path.getsize(file_path) / (1024 * 1024)
    if file_size_mb < min_size_mb:
        print(f"[!] Archivo {file_path} parece corrupto o incompleto ({file_size_mb:.2f}MB).")
        return False
    return True

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

# Models Directory
MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")

def load_sdxl_model():
    global pipe_image, loaded_models
    import torch
    from safetensors.torch import load_file
    
    if pipe_image is None:
        try:
            from diffusers import DiffusionPipeline, UNet2DConditionModel, EulerAncestralDiscreteScheduler
        except ImportError:
            from diffusers import StableDiffusionXLPipeline as DiffusionPipeline, UNet2DConditionModel, EulerAncestralDiscreteScheduler
        
        base = "stabilityai/stable-diffusion-xl-base-1.0"
        
        # MODEL SELECTION: Check for Juggernaut XL (Fooocus) first for Super Quality
        fooocus_ckpt = "/content/Fooocus/models/checkpoints/juggernautXL_v8Rundiffusion.safetensors"
        lightning_ckpt = os.path.join(MODELS_DIR, "unet", "sdxl_lightning_4step_unet.safetensors")
        
        target_ckpt = None
        is_lightning = True
        
        if os.path.exists(fooocus_ckpt):
            print(f"[*] Found Juggernaut XL (Fooocus) - Activating SUPER QUALITY Mode")
            target_ckpt = fooocus_ckpt
            is_lightning = False
        else:
            print(f"[*] Using SDXL Lightning (Fast Mode)")
            target_ckpt = lightning_ckpt
            is_lightning = True

        diffusers_cache = os.path.join(MODELS_DIR, "diffusers")
        
        print(f"[*] Loading SDXL Model from: {target_ckpt}")
        
        # Load Pipeline
        # Note: For Juggernaut (full checkpoint), it is often easier to load as a single file 
        # but to keep it consistent with our lazy loader:
        
        if not is_lightning:
            # Full XL Checkpoint Loading
            from diffusers import StableDiffusionXLPipeline
            pipe_image = StableDiffusionXLPipeline.from_single_file(
                target_ckpt,
                torch_dtype=torch.float16,
                variant="fp16",
                use_safetensors=True,
                cache_dir=diffusers_cache
            )
        else:
            # Lightning UNet Loading (Optimized for RAM)
            unet_config = UNet2DConditionModel.load_config(base, subfolder="unet", cache_dir=diffusers_cache)
            unet = UNet2DConditionModel.from_config(unet_config, torch_dtype=torch.float16)
            
            if not verify_file_integrity(target_ckpt, min_size_mb=400):
                # Re-download lightning if missing/corrupt
                from huggingface_hub import hf_hub_download
                target_ckpt = hf_hub_download("ByteDance/SDXL-Lightning", "sdxl_lightning_4step_unet.safetensors", 
                                            local_dir=os.path.dirname(lightning_ckpt), local_dir_use_symlinks=False)
            
            state_dict = load_file(target_ckpt, device="cpu")
            unet.load_state_dict(state_dict, strict=True)
            del state_dict
            
            pipe_image = DiffusionPipeline.from_pretrained(
                base, 
                unet=unet, 
                torch_dtype=torch.float16, 
                variant="fp16",
                use_safetensors=True,
                cache_dir=diffusers_cache
            )
            
            pipe_image.scheduler = EulerAncestralDiscreteScheduler.from_config(
                pipe_image.scheduler.config, 
                timestep_spacing="trailing"
            )

        # Set metadata for external use
        pipe_image.is_lightning = is_lightning
        
        print(f"[*] Moving pipeline to GPU...")
        pipe_image.to("cuda")
        
        # xFormers Optimization
        try:
            pipe_image.enable_xformers_memory_efficient_attention()
            print("[*] xFormers memory efficient attention enabled")
        except Exception as e:
            print(f"[!] xFormers not available: {e}")

        loaded_models['sdxl'] = pipe_image
        print("[✓] SDXL Lightning loaded successfully")
    
    offload_models(except_model='sdxl')
    pipe_image.to("cuda")
    return pipe_image

# Background Worker Utilities
def transcribe_and_subtitle(video_path, audio_path):
    """Real implementation using faster-whisper and moviepy."""
    global whisper_model, loaded_models
    try:
        from faster_whisper import WhisperModel
        from moviepy.editor import VideoFileClip, TextClip, CompositeVideoClip
        
        if whisper_model is None:
            print("[*] Loading Whisper model to RAM...")
            whisper_path = os.path.join(MODELS_DIR, "checkpoints")
            whisper_model = WhisperModel("base", device="cpu", compute_type="float16", download_root=whisper_path)
            loaded_models['whisper'] = whisper_model

        offload_models(except_model='whisper')
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
            
            if job['type'] == 'video':
                data = job['data']
                avatar_id = data.get('avatar_id')
                script = data.get('script')
                voice_id = data.get('voice_id', 'es-CO-SalomeNeural')
                
                # 1. TTS Generation
                socketio.emit('job_update', {"job_id": job_id, "status": "processing", "progress": 15, "message": f"Generando voz ({voice_id})..."})
                audio_path = os.path.join(work_dir, "audio.mp3")
                
                if script:
                    if not run_tts_sync(script, audio_path, voice=voice_id):
                        raise Exception("TTS Generation Failed")
                
                # 2. Animation
                socketio.emit('job_update', {"job_id": job_id, "status": "processing", "progress": 30, "message": "Animando rostro..."})
                
                avatar_path = os.path.join(DATA_DIR, "avatars", avatar_id) if avatar_id else None
                if not avatar_path or not os.path.exists(avatar_path):
                    avatar_path = os.path.join(DATA_DIR, "avatars", "default.jpg")
                
                video_path = os.path.join(work_dir, "result.mp4")
                
                # Fallback: Create simple video
                subprocess.run(
                    f"ffmpeg -loop 1 -i {avatar_path} -i {audio_path} -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest {video_path}",
                    shell=True,
                    check=True
                )

                # 3. Subtitles
                if data.get('generate_subtitles'):
                    socketio.emit('job_update', {"job_id": job_id, "status": "processing", "progress": 80, "message": "Sincronizando subtítulos..."})
                    final_path = transcribe_and_subtitle(video_path, audio_path)
                    video_path = final_path

                predictable_path = os.path.join(work_dir, "final_result.mp4")
                if video_path != predictable_path:
                    shutil.copy2(video_path, predictable_path)
                
                public_path = f"{BASE_URL}/files/jobs/{job_id}/final_result.mp4"
                jobs_status[job_id]['url'] = public_path
                jobs_status[job_id]['status'] = 'completed'
                socketio.emit('job_update', {"job_id": job_id, "status": "completed", "progress": 100, "url": public_path})

        except Exception as e:
            print(f"[!] Job {job_id} Failed: {str(e)}")
            jobs_status[job_id]['status'] = 'failed'
            jobs_status[job_id]['error'] = str(e)
            socketio.emit('job_update', {"job_id": job_id, "status": "failed", "error": str(e)})
        
        job_queue.task_done()

# Start Worker Thread
worker_thread = threading.Thread(target=background_worker, daemon=True)
worker_thread.start()

@app.route('/api/assets', methods=['GET', 'POST'])
def manage_assets():
    global assets_db
    if request.method == 'POST':
        asset = request.json
        assets_db.append(asset)
        save_json(ASSETS_FILE, assets_db)
        return jsonify({"status": "success", "assets_count": len(assets_db)})
    return jsonify({"status": "success", "assets": assets_db})

@app.route('/api/jobs/<job_id>', methods=['GET'])
def get_job_status(job_id):
    job = jobs_status.get(job_id)
    if not job:
        return jsonify({"status": "error", "message": "Job not found"}), 404
    return jsonify(job)

@app.route('/render-video', methods=['POST'])
@require_auth
def render_video():
    try:
        data = request.json
        job_id = f"vid_{int(time.time())}"
        
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

@app.route('/magic-prompt', methods=['POST'])
def magic_prompt():
    """Enhance user prompts with quality keywords and artistic style."""
    try:
        data = request.json
        prompt = data.get('prompt', '').strip()
        
        if not prompt:
            return jsonify({"status": "error", "message": "Prompt vacío"}), 400
        
        # Rule-based enhancement
        quality_keywords = "masterpiece, best quality, highly detailed, professional photography, 8k uhd, sharp focus, perfect lighting"
        
        person_keywords = ['person', 'man', 'woman', 'portrait', 'face', 'people', 'human']
        is_portrait = any(kw in prompt.lower() for kw in person_keywords)
        
        if is_portrait:
            enhanced = f"{quality_keywords}, beautiful detailed eyes, detailed face, {prompt}, cinematic lighting, bokeh background"
        else:
            enhanced = f"{quality_keywords}, {prompt}, vibrant colors, professional composition"
        
        return jsonify({
            "status": "success", 
            "prompt": enhanced,
            "original": prompt,
            "method": "Rule-Based Enhancement"
        })
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/face-swap', methods=['POST'])
@require_auth
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
        
        from services.face_swap_service import get_face_swap_service
        
        offload_models(except_model='faceswap')
        
        service = get_face_swap_service()
        result_image = service.process_base64(source_image, target_image)
        
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
@require_auth
def generate_image():
    import torch
    import traceback
    
    if not torch.cuda.is_available():
        return jsonify({"status": "error", "message": "GPU no disponible en el servidor"}), 503
    
    try:
        data = request.json
        prompt = data.get('prompt')
        style = data.get('style', 'Fooocus V2') # Default to Fooocus V2 for better quality
        user_negative = data.get('negative_prompt', '')
        steps = data.get('steps', 4)
        guidance = data.get('guidance_scale', 0)
        aspect_ratio = data.get('aspect_ratio', '1:1')
        
        # Mapping Aspect Ratio to SDXL standard dimensions (Fooocus Style)
        ratio_map = {
            '1:1': (1024, 1024),
            '16:9': (1344, 768),
            '9:16': (768, 1344),
            '21:9': (1536, 640),
            '9:21': (640, 1536),
            '11:8': (1152, 832),
            '8:11': (832, 1152),
            '4:3': (1152, 896),
            '3:4': (896, 1152)
        }
        width, height = ratio_map.get(aspect_ratio, (1024, 1024))
        
        # Load model and auto-adjust parameters if it's Juggernaut (non-lightning)
        pipe = load_sdxl_model()
        is_lightning = getattr(pipe, 'is_lightning', True)
        
        if not is_lightning:
            # Juggernaut XL needs more steps and guidance for best results
            if steps <= 8: steps = 30 # Default for high quality
            if guidance == 0: guidance = 7.0 # Default for realism
            print(f"[*] Juggernaut Mode: Auto-adjusted Steps to {steps} and Guidance to {guidance}")
        
        
        if not prompt:
            return jsonify({"status": "error", "message": "Prompt vacío o no proporcionado"}), 400
            
        # Apply Style
        style_service = get_style_service()
        final_prompt, final_negative = style_service.apply_style(style, prompt, user_negative)
        
        logger.info(f"Generating image. Style: {style}, Prompt: {prompt[:30]}...", extra={"steps": steps})
        # print(f"[*] Final Prompt: {final_prompt}")
        
        # Cache check
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
        
        # Load model
        pipe = load_sdxl_model()
        
        # Progress callback
        def progress_callback(step, timestep, latents):
            progress = int((step / steps) * 100)
            socketio.emit('generation_progress', {"progress": progress, "status": "generating"})
        
        print(f"[*] Running SDXL inference...")
        image = pipe(
            prompt=final_prompt, 
            negative_prompt=final_negative,
            num_inference_steps=steps, 
            guidance_scale=guidance, 
            width=width,
            height=height,
            callback=progress_callback, 
            callback_steps=1
        ).images[0]
        
        socketio.emit('generation_progress', {"progress": 100, "status": "completed"})
        
        print(f"[*] Encoding image to base64...")
        import io, base64
        buffered = io.BytesIO()
        image.save(buffered, format="PNG")
        image_bytes = buffered.getvalue()
        img_str = base64.b64encode(image_bytes).decode('utf-8')
        
        # Save to cache
        try:
            cache_service.save_to_cache(
                cache_key, 
                image_bytes,
                metadata={'prompt': prompt, 'steps': steps, 'guidance': guidance}
            )
        except Exception as cache_error:
            logger.error(f"Failed to save to cache: {cache_error}")
        
        logger.info(f"Image generated successfully", extra={"cached": False, "length": len(img_str)})
        return jsonify({
            "status": "success", 
            "image": f"data:image/png;base64,{img_str}",
            "cached": False
        })
        
    except Exception as e:
        error_trace = traceback.format_exc()
        logger.error(f"Image Generation Error: {str(e)}", exc_info=True)
        # print(f"[!] Traceback:\n{error_trace}")
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
    
    base_url = request.url_root.rstrip('/')
    
    for f in files:
        fname = os.path.basename(f)
        if fname.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
             avatars.append({
                "id": fname,
                "name": fname.split('.')[0].replace('_', ' ').title(),
                "img": f"{base_url}/files/avatars/{fname}"
             })
             
    if not avatars:
        avatars = [
            { "id": "demo_1", "name": "Demo User", "img": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400" }
        ]
        
    return jsonify({ "status": "success", "avatars": avatars })

@app.route('/voices', methods=['GET'])
def get_voices():
    """Retorna lista de voces disponibles de Edge TTS."""
    voices = [
        {"id": "es-CO-GonzaloNeural", "name": "Gonzalo (Colombia)", "language": "es-CO", "gender": "Male", "country": "Colombia"},
        {"id": "es-CO-SalomeNeural", "name": "Salomé (Colombia)", "language": "es-CO", "gender": "Female", "country": "Colombia"},
        {"id": "es-MX-DaliaNeural", "name": "Dalia (México)", "language": "es-MX", "gender": "Female", "country": "México"},
        {"id": "es-MX-JorgeNeural", "name": "Jorge (México)", "language": "es-MX", "gender": "Male", "country": "México"},
    ]
    
    return jsonify({ "status": "success", "voices": voices })

@app.route('/styles', methods=['GET'])
def get_styles():
    """Retorna lista de estilos disponibles."""
    return jsonify({ 
        "status": "success", 
        "styles": get_style_service().get_styles() 
    })

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 SERVIDOR FLASK INICIADO EN PUERTO 5000")
    print("="*60 + "\n")
    
    try:
        socketio.run(app, host='0.0.0.0', port=5000, debug=False, allow_unsafe_werkzeug=True)
    except KeyboardInterrupt:
        print("\n\n🛑 Servidor detenido por el usuario")
    except Exception as e:
        print(f"\n❌ Error al iniciar servidor: {e}")
