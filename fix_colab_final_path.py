
import json
import os

filepath = 'backend/Enfoads_Colab.ipynb'
token = "2yHQiBeYhFdbJSiK31054jtsKkw_54yvtD5Cs9mK2yhFgQ2j"

notebook = {
    "cells": [
        {
            "cell_type": "markdown",
            "metadata": {"id": "header"},
            "source": [
                "# 🚀 EnfoadsIA - Backend Production (T4 GPU)\n",
                "\n",
                "Este notebook está diseñado para ejecutar el ecosistema completo de **EnfoadsIA** en la nube. \n",
                "\n",
                "---"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {"id": "setup", "cellView": "form"},
            "outputs": [],
            "source": [
                "# @title 🛠️ 1. Entorno y Dependencias\n",
                "import os, sys\n",
                "\n",
                "# RESETEAR SIEMPRE AL DIRECTORIO BASE DE COLAB\n",
                "os.chdir('/content')\n",
                "\n",
                "REPO_URL = \"https://github.com/Juanpalojime/FoadsIA.git\"\n",
                "\n",
                "print(\"📡 Configurando repositorio...\")\n",
                "if not os.path.exists(\"/content/FoadsIA\"):\n",
                "    !git clone $REPO_URL\n",
                "else:\n",
                "    print(\"🔄 Actualizando repositorio activo...\")\n",
                "    !cd /content/FoadsIA && git pull\n",
                "\n",
                "# IR AL BACKEND USANDO RUTA ABSOLUTA\n",
                "os.chdir(\"/content/FoadsIA/backend\")\n",
                "print(f\"✅ Directorio actual: {os.getcwd()}\")\n",
                "\n",
                "print(\"📦 Instalando dependencias del sistema...\")\n",
                "!apt-get update -qq && apt-get install -y -qq ffmpeg libsm6 libxext6 libgl1 > /dev/null 2>&1\n",
                "\n",
                "print(\"📦 Instalando dependencias de Python (requirements.txt)...\")\n",
                "!pip install -q -r requirements.txt\n",
                "\n",
                "# Re-verificar e instalar dependencias críticas de red si falló el install masivo\n",
                "print(\"📡 Asegurando módulos de red...\")\n",
                "!pip install -q flask-socketio eventlet flask-cors pyngrok\n",
                "\n",
                "import torch\n",
                "print(f\"\\n✅ GPU LISTA: {torch.cuda.get_device_name(0)}\")"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {"id": "run", "cellView": "form"},
            "outputs": [],
            "source": [
                "# @title 🚀 2. Ejecutar Servidor\n",
                "import os\n",
                "from pyngrok import ngrok\n",
                "\n",
                "# Resetear ruta\n",
                "os.chdir(\"/content/FoadsIA/backend\")\n",
                "\n",
                "AUTH_TOKEN = \"" + token + "\" #@param {type:\"string\"}\n",
                "if AUTH_TOKEN:\n",
                "    !ngrok config add-authtoken {AUTH_TOKEN}\n",
                "\n",
                "print(\"🧹 Limpiando túneles antiguos...\")\n",
                "try:\n",
                "    tunnels = ngrok.get_tunnels()\n",
                "    for t in tunnels: ngrok.disconnect(t.public_url)\n",
                "    ngrok.kill()\n",
                "except: pass\n",
                "\n",
                "print(\"\\n🌍 Abriendo túnel de acceso...\")\n",
                "try:\n",
                "    public_url = ngrok.connect(5000).public_url\n",
                "    print(f\"\\n{'='*60}\")\n",
                "    print(f\" 📡 URL PARA EL FRONTEND: {public_url}\")\n",
                "    print(f\"{'='*60}\\n\")\n",
                "    \n",
                "    # Ejecutar backend\n",
                "    !python app.py\n",
                "    \n",
                "except Exception as e:\n",
                "    print(f\"❌ Error fatal: {e}\")"
            ]
        }
    ],
    "metadata": {
        "accelerator": "GPU",
        "colab": {"gpuType": "T4"},
        "kernelspec": {"display_name": "Python 3", "name": "python3"}
    },
    "nbformat": 4, "nbformat_minor": 0
}

with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(notebook, f, indent=4, ensure_ascii=False)

print("Notebook de Colab actualizado con rutas absolutas y verificación de módulos críticos.")
