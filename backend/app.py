import os
import sys
import time
import json
import threading
import queue
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from pyngrok import ngrok

# Initialize Flask App & SocketIO
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

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
def background_worker():
    while True:
        job = job_queue.get()
        if job is None: break
        
        job_id = job['id']
        jobs_status[job_id]['status'] = 'processing'
        socketio.emit('job_update', {"job_id": job_id, "status": "processing", "progress": 10})
        
        try:
            print(f"[*] Processing Job {job_id}: {job['type']}")
            
            # Simulate real heavy processing time
            if job['type'] == 'video':
                socketio.emit('job_update', {"job_id": job_id, "status": "processing", "progress": 30, "message": "Animando rostro..."})
                time.sleep(10) 
                
                video_url = "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4"
                
                if job['data'].get('generate_subtitles'):
                    socketio.emit('job_update', {"job_id": job_id, "status": "processing", "progress": 70, "message": "Generando subtítulos con Whisper..."})
                    time.sleep(5) 
                
                jobs_status[job_id]['url'] = video_url
            
            jobs_status[job_id]['status'] = 'completed'
            socketio.emit('job_update', {"job_id": job_id, "status": "completed", "progress": 100, "url": jobs_status[job_id]['url']})
            print(f"[+] Job {job_id} Finished.")
            
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
    return jsonify({
        "status": "online", 
        "mode": "free_oss",
        "optimization": "T4_VRAM_MANAGER"
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
        unet.load_state_dict(torch.load(hf_hub_download(repo, ckpt), map_location="cpu"))
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


def generate_image():
    import torch
    if not torch.cuda.is_available():
        return jsonify({"status": "error", "message": "GPU no disponible en el servidor"}), 503
    
    try:
        data = request.json
        prompt = data.get('prompt')
        pipe = load_sdxl_model()
        image = pipe(prompt, num_inference_steps=4, guidance_scale=0).images[0]
        
        import io, base64
        buffered = io.BytesIO()
        image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')
        return jsonify({"status": "success", "image": f"data:image/png;base64,{img_str}"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

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
    avatars = [
        { "id": "av-1", "name": "Premium Male", "img": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300" },
        { "id": "av-2", "name": "Premium Female", "img": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300" }
    ]
    return jsonify({ "status": "success", "avatars": avatars })

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

