
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
                "# --- RESETEAR DIRECTORIO ---\n",
                "%cd /content\n",
                "\n",
                "REPO_URL = \"https://github.com/Juanpalojime/FoadsIA.git\"\n",
                "\n",
                "print(\"📡 Configurando repositorio...\")\n",
                "if not os.path.exists(\"FoadsIA\"):\n",
                "    !git clone $REPO_URL\n",
                "else:\n",
                "    !cd FoadsIA && git pull\n",
                "\n",
                "# Ir al backend con ruta absoluta para evitar anidamiento\n",
                "%cd /content/FoadsIA/backend\n",
                "\n",
                "print(\"📦 Instalando dependencias del sistema...\")\n",
                "!apt-get update -qq && apt-get install -y -qq ffmpeg libsm6 libxext6 libgl1 > /dev/null 2>&1\n",
                "\n",
                "print(\"📦 Instalando dependencias de Python...\")\n",
                "!pip install -q -r requirements.txt\n",
                "# Re-asegurar dependencias críticas por si falla el requirements\n",
                "!pip install -q flask-socketio eventlet flask-cors pyngrok faster-whisper moviepy\n",
                "\n",
                "import torch\n",
                "print(f\"✅ GPU LISTA: {torch.cuda.get_device_name(0)}\")"
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
                "%cd /content/FoadsIA/backend\n",
                "\n",
                "AUTH_TOKEN = \"" + token + "\" #@param {type:\"string\"}\n",
                "!ngrok config add-authtoken {AUTH_TOKEN}\n",
                "\n",
                "print(\"🧹 Limpiando procesos antiguos...\")\n",
                "try:\n",
                "    !pkill ngrok\n",
                "    ngrok.kill()\n",
                "except: pass\n",
                "\n",
                "print(\"\\n🌍 Abriendo túnel de acceso...\")\n",
                "try:\n",
                "    public_url = ngrok.connect(5000).public_url\n",
                "    print(f\"\\n{'='*60}\")\n",
                "    print(f\" 📡 URL: {public_url}\")\n",
                "    print(f\"{'='*60}\\n\")\n",
                "    \n",
                "    !NGROK_AUTHTOKEN={AUTH_TOKEN} python app.py\n",
                "    \n",
                "except Exception as e:\n",
                "    print(f\"❌ Error: {e}\")"
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

print("Notebook de Colab corregido para evitar directorios anidados y asegurar flask-socketio.")
