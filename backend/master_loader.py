
import os
import sys
import time
import torch
from pathlib import Path
from huggingface_hub import hf_hub_download
from diffusers import DiffusionPipeline, UNet2DConditionModel, EulerAncestralDiscreteScheduler
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
    
    try:
        # 1. Descargar Checkpoint UNet (El archivo pesado)
        log(f"Verificando/Descargando Checkpoint UNet ({ckpt})...")
        unet_path = hf_hub_download(repo, ckpt)
        log(f"Checkpoint listo en: {unet_path}", "success")
        
        # 2. Descargar Configuración Base (VAE, Tokenizers, Scheduler)
        log("Verificando el ecosistema base (SDXL 1.0)...")
        DiffusionPipeline.from_pretrained(
            base, 
            torch_dtype=torch.float16, 
            variant="fp16", 
            use_safetensors=True
        )
        log("Ecosistema base listo.", "success")
        return True
        
    except Exception as e:
        log(f"Error descargando SDXL: {str(e)}", "error")
        return False

def download_whisper():
    log("Gestionando Whisper (Audio)...", "header")
    try:
        log("Descargando modelo 'small'...")
        whisper.load_model("small")
        log("Whisper listo.", "success")
        return True
    except Exception as e:
        log(f"Error con Whisper: {str(e)}", "error")
        return False

def test_load_models():
    log("Prueba de Carga en Memoria (Dry Run)", "header")
    
    try:
        # Tintentar cargar SDXL
        log("Cargando SDXL a VRAM (simulacro)...")
        base = "stabilityai/stable-diffusion-xl-base-1.0"
        repo = "ByteDance/SDXL-Lightning"
        ckpt = "sdxl_lightning_4step_unet.safetensors"
        
        # Load Config & UNet
        unet_config = UNet2DConditionModel.load_config(base, subfolder="unet")
        unet = UNet2DConditionModel.from_config(unet_config)
        unet.load_state_dict(torch.load(hf_hub_download(repo, ckpt), map_location="cpu", weights_only=True))
        
        # Load Pipeline
        pipe = DiffusionPipeline.from_pretrained(
            base, 
            unet=unet, 
            torch_dtype=torch.float16, 
            variant="fp16",
            use_safetensors=True
        )
        
        # Move to CUDA
        if torch.cuda.is_available():
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
        return False

def main():
    start_time = time.time()
    log("INICIANDO SCRIPT MAESTRO DE MODELOS", "header")
    
    has_gpu = check_gpu()
    
    # 1. Descargas
    sdxl_ok = download_sdxl_lightning()
    whisper_ok = download_whisper()
    
    if not sdxl_ok or not whisper_ok:
        log("Hubo errores en la descarga. Revisa tu conexión.", "error")
        return
    
    # 2. Prueba de Carga (Solo si hay GPU para probar realismo)
    if has_gpu:
        load_ok = test_load_models()
        if not load_ok:
            log("Descarga ok, pero fallo al cargar en GPU. Posible falta de VRAM.", "warn")
    
    elapsed = time.time() - start_time
    log(f"Operación completada en {elapsed:.2f} segundos", "success")
    print("\n✅ TODO LISTO. Puedes iniciar 'app.py' con confianza.\n")

if __name__ == "__main__":
    main()
