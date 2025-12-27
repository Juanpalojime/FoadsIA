import os
import subprocess
import sys

def run_command(cmd, description):
    print(f"⚙️  {description}...")
    try:
        subprocess.run(cmd, shell=True, check=True)
        print(f"✅ {description} completado")
        return True
    except Exception as e:
        print(f"❌ Error en {description}: {e}")
        return False

def setup():
    backend_dir = os.getcwd()
    
    # 1. Clone Repo if not exists
    if not os.path.exists("LivePortrait"):
        run_command("git clone https://github.com/KwaiVGI/LivePortrait", "Clonando LivePortrait")
    
    # 2. Install Dependencies
    print("📦 Instalando dependencias de LivePortrait...")
    # These are often specific
    lp_deps = "gradio pyyaml omegaconf coloredlogs"
    run_command(f"pip install -q {lp_deps}", "Dependencias base de LP")
    
    # 3. Download Models using our other script
    if os.path.exists("download_lp_models.py"):
        run_command("python download_lp_models.py", "Descargando pesos de LivePortrait (~700MB)")
    else:
        print("⚠️  No se encontró download_lp_models.py")

if __name__ == "__main__":
    setup()
