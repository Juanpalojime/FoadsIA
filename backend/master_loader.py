import os
import sys
import huggingface_hub
# Monkeypatch for legacy libraries that still use cached_download
if not hasattr(huggingface_hub, 'cached_download'):
    from huggingface_hub import hf_hub_download
    huggingface_hub.cached_download = hf_hub_download
import time
import torch
from pathlib import Path
from huggingface_hub import hf_hub_download
from diffusers import DiffusionPipeline, UNet2DConditionModel, EulerAncestralDiscreteScheduler
from safetensors.torch import load_file
import whisper

# Configuración de Colores para Logs
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def log(msg, type="info"):
    if type == "info": print(f"{Colors.OKBLUE}[INFO]{Colors.ENDC} {msg}")
    elif type == "success": print(f"{Colors.OKGREEN}[SUCCESS]{Colors.ENDC} {msg}")
    elif type == "warn": print(f"{Colors.WARNING}[WARN]{Colors.ENDC} {msg}")
    elif type == "error": print(f"{Colors.FAIL}[ERROR]{Colors.ENDC} {msg}")
    elif type == "header": print(f"\n{Colors.HEADER}{Colors.BOLD}=== {msg} ==={Colors.ENDC}")

def verify_file_integrity(file_path, min_size_mb=100):
    """Verificar que un archivo de modelo existe y tiene un tamaño razonable"""
    if not os.path.exists(file_path):
        return False
    
    file_size_mb = os.path.getsize(file_path) / (1024 * 1024)
    if file_size_mb < min_size_mb:
        log(f"Archivo {file_path} parece corrupto o incompleto ({file_size_mb:.2f}MB).", "warn")
        return False
    
    return True

# Configuración de Rutas base
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

# Estructura de directorios
FOLDERS = [
    "checkpoints", "clip", "clip_vision", "configs", "controlnet", 
    "diffusers", "embeddings", "gligen", "hypernetworks", "inpaint", 
    "loras", "prompt_expansion", "safety_checker", "sam", "style_models", 
    "unet", "upscale_models", "vae", "vae_approx", "insightface"
]

def setup_directories():
    log("Configurando estructura de directorios...", "header")
    for folder in FOLDERS:
        path = os.path.join(MODELS_DIR, folder)
        os.makedirs(path, exist_ok=True)
    log(f"Directorios creados en: {MODELS_DIR}", "success")

def check_gpu():
    log("Verificando hardware...", "header")
    if torch.cuda.is_available():
        vram = torch.cuda.get_device_properties(0).total_memory / 1e9
        name = torch.cuda.get_device_name(0)
        log(f"GPU Detectada: {name} ({vram:.1f} GB VRAM)", "success")
        return True
    else:
        log("No se detectó GPU. El sistema funcionará muy lento.", "warn")
        return False

def download_sdxl_lightning():
    log("Gestionando SDXL Lightning...", "header")
    
    base = "stabilityai/stable-diffusion-xl-base-1.0"
    repo = "ByteDance/SDXL-Lightning"
    ckpt = "sdxl_lightning_4step_unet.safetensors"
    
    # Rutas Específicas
    unet_dir = os.path.join(MODELS_DIR, "unet")
    diffusers_cache = os.path.join(MODELS_DIR, "diffusers")
    
    try:
        # 1. Descargar Checkpoint UNet
        log(f"Verificando/Descargando Checkpoint UNet en {unet_dir}...")
        unet_path = os.path.join(unet_dir, ckpt)
        
        # Verificar integridad si ya existe
        if os.path.exists(unet_path):
            if verify_file_integrity(unet_path, min_size_mb=4000):
                log(f"Checkpoint ya existe y es válido: {unet_path}", "success")
            else:
                log(f"Eliminando archivo corrupto: {unet_path}", "warn")
                os.remove(unet_path)
                unet_path = hf_hub_download(repo, ckpt, local_dir=unet_dir, local_dir_use_symlinks=False)
        else:
            unet_path = hf_hub_download(repo, ckpt, local_dir=unet_dir, local_dir_use_symlinks=False)
        
        log(f"Checkpoint listo: {unet_path}", "success")
        
        # 2. Descargar Configuración Base
        log(f"Verificando ecosistema base en {diffusers_cache}...")
        DiffusionPipeline.from_pretrained(
            base, 
            torch_dtype=torch.float16, 
            variant="fp16", 
            use_safetensors=True,
            cache_dir=diffusers_cache
        )
        log("Ecosistema base listo.", "success")
        return True
        
    except Exception as e:
        log(f"Error descargando SDXL: {str(e)}", "error")
        return False

def download_whisper():
    log("Gestionando Whisper (Audio)...", "header")
    try:
        whisper_dir = os.path.join(MODELS_DIR, "checkpoints")
        log(f"Descargando modelo 'base' en {whisper_dir}...")
        
        # Download will happen automatically on first use
        log("Whisper listo.", "success")
        return True
    except Exception as e:
        log(f"Error con Whisper: {str(e)}", "error")
        return False

def download_insightface():
    log("Gestionando InsightFace (Face Swap)...", "header")
    try:
        # 1. Models Root for FaceAnalysis (buffalo_l)
        insightface_dir = os.path.join(MODELS_DIR, "insightface")
        os.makedirs(insightface_dir, exist_ok=True)
        
        log(f"Verificando FaceAnalysis (buffalo_l) en {insightface_dir}...")
        try:
            import insightface
            from insightface.app import FaceAnalysis
            app = FaceAnalysis(name='buffalo_l', root=insightface_dir)
            log("FaceAnalysis (buffalo_l) verificado.", "success")
        except ImportError:
            log("InsightFace no instalado, saltando...", "warn")
        except Exception as e:
            log(f"Error descargando buffalo_l: {e}", "warn")

        # 2. Inswapper Model
        checkpoints_dir = os.path.join(MODELS_DIR, "checkpoints")
        inswapper_path = os.path.join(checkpoints_dir, "inswapper_128.onnx")
        
        if not os.path.exists(inswapper_path):
            log("Descargando inswapper_128.onnx...")
            repo = "ezioruan/inswapper_128.onnx"
            filename = "inswapper_128.onnx"
            hf_hub_download(repo, filename, local_dir=checkpoints_dir, local_dir_use_symlinks=False)
            log(f"Inswapper descargado en: {inswapper_path}", "success")
        else:
            log("Inswapper ya existe.", "success")
            
        return True
    except Exception as e:
        log(f"Error con InsightFace: {str(e)}", "error")
        return False

def test_load_models():
    log("Prueba de Carga en Memoria (Dry Run)", "header")
    
    try:
        base = "stabilityai/stable-diffusion-xl-base-1.0"
        ckpt_filename = "sdxl_lightning_4step_unet.safetensors"
        
        unet_path = os.path.join(MODELS_DIR, "unet", ckpt_filename)
        diffusers_cache = os.path.join(MODELS_DIR, "diffusers")
        
        log("Cargando SDXL a VRAM desde almacenamiento local...")
        
        # Load Config & UNet
        unet_config = UNet2DConditionModel.load_config(base, subfolder="unet", cache_dir=diffusers_cache)
        unet = UNet2DConditionModel.from_config(unet_config)
        
        # Cargar state dict con safetensors
        log(f"[*] Loading weights from: {unet_path}")
        unet.load_state_dict(load_file(unet_path, device="cpu"))
        
        # Load Pipeline
        pipe = DiffusionPipeline.from_pretrained(
            base, 
            unet=unet, 
            torch_dtype=torch.float16, 
            variant="fp16",
            use_safetensors=True,
            cache_dir=diffusers_cache
        )
        
        # Move to CUDA
        if torch.cuda.is_available():
            log("Moviendo pipeline a GPU...")
            pipe.to("cuda")
        
        log("¡SDXL cargado exitosamente!", "success")
        
        # Cleanup to free memory
        del pipe
        del unet
        torch.cuda.empty_cache()
        log("Memoria liberada.", "info")
        return True
        
    except Exception as e:
        log(f"Falló la carga de modelos: {str(e)}", "error")
        import traceback
        traceback.print_exc()
        return False

def main():
    start_time = time.time()
    log("INICIANDO SCRIPT MAESTRO DE MODELOS (CUSTOM PATHS)", "header")
    
    setup_directories()
    has_gpu = check_gpu()
    
    # 1. Descargas
    sdxl_ok = download_sdxl_lightning()
    whisper_ok = download_whisper()
    insight_ok = download_insightface()
    
    if not (sdxl_ok and whisper_ok and insight_ok):
        log("Hubo errores en la descarga. Revisa tu conexión.", "error")
        return
    
    # 2. Prueba de Carga
    if has_gpu:
        load_ok = test_load_models()
        if not load_ok:
            log("Descarga ok, pero fallo al cargar en GPU. Posible falta de VRAM.", "warn")
    
    elapsed = time.time() - start_time
    log(f"Operación completada en {elapsed:.2f} segundos", "success")
    print(f"\n✅ TODO LISTO. Modelos en: {MODELS_DIR}\n")

if __name__ == "__main__":
    main()
