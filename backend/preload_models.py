#!/usr/bin/env python3
"""
Pre-descarga de Modelos para EnfoadsIA
Ejecutar este script en Colab ANTES de iniciar el servidor
para evitar esperas durante la primera generación.

Uso en Colab:
    !python preload_models.py
"""

import os
import sys
from pathlib import Path

def preload_models():
    """Pre-descarga todos los modelos necesarios."""
    
    print("📥 PRE-DESCARGA DE MODELOS DE IA\n")
    print("="*70)
    print("⏱️  Esto puede tomar 5-10 minutos la primera vez")
    print("💡 Los modelos se cachean, las siguientes ejecuciones serán instantáneas")
    print("="*70 + "\n")

    # 1. SDXL Lightning
    print("\n🎨 Descargando SDXL Lightning (4-step)...")
    try:
        from huggingface_hub import hf_hub_download
        import torch
        
        repo = "ByteDance/SDXL-Lightning"
        ckpt = "sdxl_lightning_4step_unet.safetensors"
        
        print(f"   📦 Descargando desde {repo}...")
        model_path = hf_hub_download(repo, ckpt)
        print(f"   ✅ SDXL Lightning descargado: {model_path}")
        
        # También descargar el modelo base
        print("   📦 Descargando SDXL Base...")
        from diffusers import StableDiffusionXLPipeline
        base = "stabilityai/stable-diffusion-xl-base-1.0"
        pipe = StableDiffusionXLPipeline.from_pretrained(
            base, 
            torch_dtype=torch.float16, 
            variant="fp16",
            use_safetensors=True
        )
        print("   ✅ SDXL Base descargado\n")
        del pipe
        torch.cuda.empty_cache()
        
    except Exception as e:
        print(f"   ❌ Error: {e}\n")

    # 2. Faster Whisper
    print("🎤 Descargando Faster-Whisper (base)...")
    try:
        from faster_whisper import WhisperModel
        
        print("   📦 Descargando modelo base...")
        model = WhisperModel("base", device="cpu", compute_type="float16")
        print("   ✅ Whisper descargado\n")
        del model
        
    except Exception as e:
        print(f"   ❌ Error: {e}\n")

    # 3. InsightFace
    print("👤 Descargando modelos de InsightFace...")
    try:
        import insightface
        from insightface.app import FaceAnalysis
        
        print("   📦 Descargando buffalo_l...")
        app = FaceAnalysis(name='buffalo_l', providers=['CPUExecutionProvider'])
        app.prepare(ctx_id=-1, det_size=(640, 640))
        print("   ✅ InsightFace descargado\n")
        del app
        
    except Exception as e:
        print(f"   ❌ Error: {e}\n")

    # Verificar espacio en disco
    print("\n💾 Verificando espacio en disco...")
    try:
        import shutil
        total, used, free = shutil.disk_usage("/")
        print(f"   Total: {total // (2**30)} GB")
        print(f"   Usado: {used // (2**30)} GB")
        print(f"   Libre: {free // (2**30)} GB")
    except:
        pass

    print("\n" + "="*70)
    print("🎉 PRE-DESCARGA COMPLETADA")
    print("="*70)
    print("\n💡 Ahora puedes ejecutar el servidor sin esperas de descarga\n")

    # Limpiar memoria
    import gc
    gc.collect()
    try:
        import torch
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
    except:
        pass

if __name__ == "__main__":
    preload_models()
