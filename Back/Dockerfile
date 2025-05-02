# backend/Dockerfile

# Stage 1: Base con Node.js y dependencias OS
FROM node:18-slim AS base

# Instalar dependencias esenciales del sistema operativo
# Incluye: python3, pip, ffmpeg, gstreamer, python3-gi (bindings GObject), python3-gst-1.0 (bindings GStreamer)
# git y build-essential pueden ser necesarios para algunas instalaciones de pip
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    ffmpeg \
    gstreamer1.0-tools \
    gstreamer1.0-plugins-base \
    gstreamer1.0-plugins-good \
    gstreamer1.0-plugins-bad \
    gstreamer1.0-plugins-ugly \
    gstreamer1.0-libav \
    libgstreamer1.0-0 \
    libgstreamer-plugins-base1.0-0 \
    gir1.2-gstreamer-1.0 \
    gir1.2-gst-plugins-base-1.0 \
    python3-gi \
    python3-gst-1.0 \
    # Dependencias adicionales que podrían ser necesarias para python-socketio o WebRTC
    build-essential \
    libopus-dev libvpx-dev libsrtp2-dev \
    # Limpiar caché de apt
    && rm -rf /var/lib/apt/lists/*

# Establecer directorio de trabajo
WORKDIR /app/backend

# Copiar archivos de dependencias Node.js
COPY package.json package-lock.json* ./

# Instalar dependencias Node.js (¡Asegúrate que 'concurrently' esté en dependencies, no solo devDependencies!)
# Si no usas concurrently para lanzar ambos servidores, puedes usar --production
RUN npm install

# Instalar dependencias Python (usando pip dentro del contenedor)
# Asumiendo que gstreamer_webrtc_sender.py usa python-socketio[client]
# Considera crear un requirements.txt para Python si tienes más dependencias
RUN pip3 install --no-cache-dir "python-socketio[client]>=5"

# Copiar el resto del código de la aplicación backend
COPY . .

# Crear directorio HLS si no existe (aunque se monta como volumen)
RUN mkdir -p /app/backend/hls

# Exponer puertos (Backend API y Señalización)
EXPOSE 5000
EXPOSE 5001

# Comando para iniciar la aplicación
# Asume que tienes un script 'start:all' en package.json que usa concurrently
# O ajusta según cómo lances server.js y signalingServer.js
# Si server.js NO lanza los procesos hijos (ffmpeg, python), necesitarás PM2 o similar
# Si 'start' ya lanza todo, puedes usar CMD ["npm", "start"]
# Asegúrate que las rutas en .env (FFMPEG_PATH, PYTHON_PATH, GSTREAMER_PYTHON_SCRIPT)
# funcionen DENTRO del contenedor (e.g., usar 'ffmpeg', 'python3', './gstreamer_webrtc_sender.py')
# O ajusta las variables en docker-compose.yml
CMD ["npm", "run", "start:all"]

# Nota: Podrías necesitar ajustar el script 'start:all' en package.json
# para asegurar que usa 'python3' y rutas relativas correctas dentro del contenedor.
# Ejemplo de ajuste en package.json:
# "scripts": {
#   "start:backend": "node server.js",
#   "start:signal": "node signalingServer.js",
#   "start:all": "concurrently \"npm:start:backend\" \"npm:start:signal\""
# }
# (El script Python es lanzado por server.js, así que no necesita estar aquí)