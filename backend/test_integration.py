import requests
import base64
import time
import os

BASE_URL = "https://spriggiest-pluggable-roosevelt.ngrok-free.dev"
HEADERS = {"ngrok-skip-browser-warning": "true"}

def test_image_generation():
    print("\n--- 🎨 TEST: GENERACIÓN DE IMAGEN ---")
    prompt = "A futuristic cyberpunk city with neon lights, 8k, highly detailed"
    payload = {
        "prompt": prompt,
        "aspect_ratio": "1:1"
    }
    
    try:
        start_time = time.time()
        response = requests.post(f"{BASE_URL}/generate-image", json=payload, headers=HEADERS)
        elapsed = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'success':
                img_data = data.get('image')
                if img_data:
                    # Save for verification
                    filename = "test_image_result.png"
                    with open(filename, "wb") as f:
                        f.write(base64.b64decode(img_data.split(',')[1]))
                    print(f"✅ ÉXITO: Imagen generada y guardada como '{filename}'")
                    print(f"⏱️  Tiempo: {elapsed:.2f}s")
                else:
                    print("❌ ERROR: No se recibió imagen")
            else:
                print(f"❌ ERROR API: {data.get('message')}")
        else:
            print(f"❌ ERROR HTTP {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ ERROR CONEXIÓN: {e}")

def test_video_and_audio_generation():
    print("\n--- 🎬 TEST: GENERACIÓN DE VIDEO Y AUDIO (TTS) ---")
    # First, get an avatar
    try:
        avatars_res = requests.get(f"{BASE_URL}/avatars", headers=HEADERS)
        if avatars_res.status_code == 200:
            avatar_id = avatars_res.json()['avatars'][0]['id']
            print(f"👤 Usando avatar: {avatar_id}")
        else:
            print("⚠️ No se pudieron obtener avatars, usando fallback default.jpg")
            avatar_id = "default.jpg"
    except:
        avatar_id = "default.jpg"

    payload = {
        "avatar_id": avatar_id,
        "script": "Hola, esta es una prueba de generación de voz y video en la plataforma Foads I A.",
        "generate_subtitles": True
    }
    
    try:
        response = requests.post(f"{BASE_URL}/render-video", json=payload, headers=HEADERS)
        if response.status_code == 200:
            data = response.json()
            job_id = data.get('job_id')
            print(f"✅ ÉXITO: Trabajo de video encolado. Job ID: {job_id}")
            
            # Poll status for a few seconds to see if it starts
            print("⏳ Monitoreando estado (10s)...")
            for _ in range(10):
                time.sleep(1)
                status_res = requests.get(f"{BASE_URL}/api/jobs/{job_id}", headers=HEADERS)
                if status_res.status_code == 200:
                    status_data = status_res.json()
                    print(f"   [{job_id}] Estado: {status_data['status']} - Progreso: {status_data.get('progress', 0)}%")
                    if status_data['status'] == 'completed':
                        print(f"🎬 VIDEO LISTO: {status_data.get('url')}")
                        break
                    if status_data['status'] == 'failed':
                        print(f"❌ ERROR EN JOB: {status_data.get('error')}")
                        break
                else:
                    print("❌ No se pudo obtener el estado del job")
        else:
            print(f"❌ ERROR HTTP {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ ERROR CONEXIÓN: {e}")

if __name__ == "__main__":
    print("🚀 INICIANDO PRUEBAS DE INTEGRACIÓN")
    test_image_generation()
    test_video_and_audio_generation()
