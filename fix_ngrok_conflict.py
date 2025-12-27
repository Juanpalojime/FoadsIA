
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
                "os.chdir('/content')\n",
                "REPO_URL = \"https://github.com/Juanpalojime/FoadsIA.git\"\n",
                "\n",
                "print(\"📡 Configurando repositorio...\")\n",
                "if not os.path.exists(\"/content/FoadsIA\"):\n",
                "    !git clone $REPO_URL\n",
                "else:\n",
                "    !cd /content/FoadsIA && git pull\n",
                "\n",
                "os.chdir(\"/content/FoadsIA/backend\")\n",
                "print(\"📦 Instalando dependencias...\")\n",
                "!apt-get update -qq && apt-get install -y -qq ffmpeg libsm6 libxext6 libgl1 > /dev/null 2>&1\n",
                "!pip install -q -r requirements.txt\n",
                "!pip install -q flask-socketio eventlet flask-cors pyngrok\n",
                "\n",
                "import torch\n",
                "print(f\"\\n✅ SISTEMA LISTO\")"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {"id": "run", "cellView": "form"},
            "outputs": [],
            "source": [
                "# @title 🚀 2. Ejecutar Servidor (Solución ERR_NGROK_108)\n",
                "import os, time\n",
                "from pyngrok import ngrok\n",
                "\n",
                "AUTH_TOKEN = \"" + token + "\" #@param {type:\"string\"}\n",
                "!ngrok config add-authtoken {AUTH_TOKEN}\n",
                "\n",
                "print(\"🧹 Limpiando procesos antiguos...\")\n",
                "try:\n",
                "    tunnels = ngrok.get_tunnels()\n",
                "    for t in tunnels: ngrok.disconnect(t.public_url)\n",
                "    !pkill ngrok\n",
                "    time.sleep(2)\n",
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
                "    !python app.py\n",
                "    \n",
                "except Exception as e:\n",
                "    print(f\"\\n{'!'*60}\")\n",
                "    print(f\"❌ ERROR DE CONEXIÓN: {e}\")\n",
                "    if \"1 simultaneous ngrok agent\" in str(e):\n",
                "        print(\"\\n💡 SOLUCIÓN DETECTADA:\")\n",
                "        print(\"Tu cuenta gratuita de Ngrok ya tiene una sesión abierta en otro lugar.\")\n",
                "        print(\"1. Cierra cualquier terminal con ngrok en tu PC.\")\n",
                "        print(\"2. Ve a: https://dashboard.ngrok.com/agents\")\n",
                "        print(\"3. Haz clic en 'Stop Agent' en las sesiones activas.\")\n",
                "        print(\"4. Vuelve a ejecutar esta celda.\")\n",
                "    print(f\"{'!'*60}\\n\")"
            ]
        }
    ],\n",
    "metadata": {
        "accelerator": "GPU",
        "colab": {"gpuType": "T4"},
        "kernelspec": {"display_name": "Python 3", "name": "python3"}
    },
    "nbformat": 4, "nbformat_minor": 0
}

with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(notebook, f, indent=4, ensure_ascii=False)

print("Notebook actualizado con guía de resolución para ERR_NGROK_108.")
