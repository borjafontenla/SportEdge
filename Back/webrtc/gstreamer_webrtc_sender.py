#!/usr/bin/env python3
import gi
import argparse
gi.require_version('Gst', '1.0')
gi.require_version('GstWebRTC', '1.0')
gi.require_version('GstSdp', '1.0')
from gi.repository import Gst, GstWebRTC, GstSdp, GLib
import socketio
import sys

# --- CAMBIO: Argumentos actualizados ---
parser = argparse.ArgumentParser(description='GStreamer MIPI to WebRTC Sender')
# El argumento --rtsp-url se reemplaza por --sensor-id
parser.add_argument('--sensor-id', type=int, required=True, help='MIPI CSI camera sensor ID (e.g., 0 or 1)')
parser.add_argument('--camera-id', required=True, help='Unique ID for this camera stream')
parser.add_argument('--signaling-server', default='http://localhost:5001', help='URL of the signaling server')
parser.add_argument('--stun-server', default='stun://stun.l.google.com:19302', help='STUN server URL')
parser.add_argument('--video-width', type=int, default=1280, help='Output video width')
parser.add_argument('--video-height', type=int, default=720, help='Output video height')
args = parser.parse_args()

CAMERA_ID = args.camera_id
SENSOR_ID = args.sensor_id
SIGNALING_SERVER = args.signaling_server
STUN_SERVER = args.stun_server
WIDTH = args.video_width
HEIGHT = args.video_height

print(f"[{CAMERA_ID}] Iniciando WebRTC Sender para Sensor MIPI ID: {SENSOR_ID}")
print(f"[{CAMERA_ID}] Iniciando WebRTC Sender:")
print(f"[{CAMERA_ID}]   RTSP Source: {RTSP_SRC_LOCATION}")
print(f"[{CAMERA_ID}]   Signaling: {SIGNALING_SERVER}")
print(f"[{CAMERA_ID}]   STUN: {STUN_SERVER}")
print(f"[{CAMERA_ID}]   Encoding: VP8 {WIDTH}x{HEIGHT}")

# --- Inicialización ---
Gst.init(None)
sio = socketio.Client(logger=False, engineio_logger=False) # Menos verboso
pipeline = None
webrtc = None

# --- Socket.IO Event Handlers ---
@sio.event
def connect():
    print(f"[{CAMERA_ID}] Conectado al signaling server: {sio.sid}")
    # Unirse a una sala específica para esta cámara podría ser útil
    # sio.emit('join_room', CAMERA_ID)

@sio.event
def disconnect():
    print(f"[{CAMERA_ID}] Desconectado del signaling server")

@sio.on('signal')
def on_signal(data):
    # Solo procesar señales dirigidas a esta cámara (si el servidor las filtra)
    # o si la data contiene una forma de identificar al destinatario
    # Por ahora, asumimos que el frontend envía la respuesta correcta.
    if not isinstance(data, dict): return # Ignorar si no es un diccionario

    sdp_text = data.get('sdp')
    sdp_type = data.get('type') # Esperamos 'answer' desde el frontend

    # Ignorar ofertas que podríamos recibir de otros peers si estamos en una sala común
    if sdp_type != 'answer' or not sdp_text or not webrtc:
      print(f"[{CAMERA_ID}] Ignorando señal SDP recibida (tipo: {sdp_type})")
      return

    print(f"[{CAMERA_ID}] Recibida respuesta SDP del peer:")
    # print(sdp_text) # Descomentar para depurar SDP

    sdp_res, sdp_msg = GstSdp.sdp_message_new_from_text(sdp_text)
    if sdp_res != GstSdp.SDPResult.OK:
        print(f"[{CAMERA_ID}] Error al parsear SDP recibido: {sdp_res}")
        return

    answer = GstWebRTC.WebRTCSessionDescription.new(GstWebRTC.WebRTCSDPType.ANSWER, sdp_msg)
    promise = Gst.Promise.new()
    webrtc.emit("set-remote-description", answer, promise)
    promise.interrupt() # No esperamos el resultado aquí
    print(f"[{CAMERA_ID}] Descripción remota (answer) establecida.")

@sio.on('request_offer') # Evento personalizado si el frontend quiere iniciar
def on_request_offer(data):
    peer_sid = data.get('sid') # ID del socket que solicita
    if peer_sid and webrtc:
        print(f"[{CAMERA_ID}] Peer {peer_sid} solicitó oferta SDP. Creando...")
        # Aquí podrías añadir lógica para manejar múltiples peers si es necesario
        promise = Gst.Promise.new_with_change_func(offer_created, webrtc, peer_sid)
        webrtc.emit("create-offer", None, promise)


@sio.event
def connect_error(err):
    print(f"[{CAMERA_ID}] Error de conexión con Socket.IO: {err}")

@sio.event
def error(err):
     print(f"[{CAMERA_ID}] Error general de Socket.IO: {err}")

# --- GStreamer Pipeline y WebRTC Callbacks ---

# Optimización: Pipeline H.264 (si el navegador soporta y el stream RTSP es H.264)
# pipeline_str = f'''
#   rtspsrc location="{RTSP_SRC_LOCATION}" name=src latency=0 !
#   rtph264depay !
#   h264parse config-interval=-1 !
#   rtph264pay name=pay0 pt=96 !
#   webrtcbin name=sendrecv bundle-policy=max-bundle stun-server={STUN_SERVER}
# '''

# Pipeline con re-codificación a VP8 (más compatible, pero más CPU)
pipeline_str = f'''
  nvarguscamerasrc sensor-id={SENSOR_ID} !
  video/x-raw(memory:NVMM),width={WIDTH},height={HEIGHT},framerate=30/1 !
  nvvidconv !
  vp8enc deadline=1 !  # Codificador VP8 acelerado por hardware
  rtpvp8pay !
  queue !
  webrtcbin name=sendrecv bundle-policy=max-bundle stun-server={STUN_SERVER}
'''
def on_negotiation_needed(element):
    print(f"[{CAMERA_ID}] Negociación necesaria, creando oferta SDP...")
    promise = Gst.Promise.new_with_change_func(offer_created, element, None) # Pasar None como user_data inicial
    element.emit("create-offer", None, promise)

def offer_created(promise, element, user_data):
    # user_data aquí podría ser el SID del peer que solicitó, si usamos 'request_offer'
    peer_sid = user_data
    try:
      reply = promise.get_reply()
      offer = reply.get_value("offer")
      promise = Gst.Promise.new()
      element.emit("set-local-description", offer, promise)
      promise.interrupt() # No esperamos resultado

      sdp_text = offer.sdp.as_text()
      print(f"[{CAMERA_ID}] Oferta SDP creada. Enviando al servidor...")
      # print(sdp_text) # Descomentar para depurar

      # Enviar la oferta al servidor. Si fue solicitada, enviarla al solicitante.
      # Si no, enviarla de forma general (broadcast o a una sala).
      signal_data = {'sdp': sdp_text, 'type': 'offer', 'cameraId': CAMERA_ID}
      # if peer_sid:
      #   sio.emit('signal_to', {'targetSid': peer_sid, 'data': signal_data})
      # else:
      sio.emit('signal', signal_data) # Broadcast simple por ahora

    except Exception as e:
      print(f"[{CAMERA_ID}] Error al crear/enviar oferta: {e}")


def on_ice_candidate(element, mline_index, candidate):
    print(f"[{CAMERA_ID}] ICE Candidate generado. Enviando...")
    ice_data = {'candidate': candidate, 'sdpMLineIndex': mline_index, 'cameraId': CAMERA_ID}
    sio.emit('signal', ice_data) # Reenvía el candidato (simple-peer lo entiende)


def on_incoming_stream(element, stream):
    # Este lado es solo emisor, no deberíamos recibir streams
    print(f"[{CAMERA_ID}] Advertencia: Recibido stream inesperado {stream.get_stream_id()}")


# --- Inicio ---
def start_pipeline():
    global pipeline, webrtc
    print(f"[{CAMERA_ID}] Creando pipeline GStreamer...")
    # print(pipeline_str) # Descomentar para ver pipeline final
    try:
        pipeline = Gst.parse_launch(pipeline_str)
        webrtc = pipeline.get_by_name("sendrecv")

        if not webrtc:
            print(f"[{CAMERA_ID}] Error: No se encontró el elemento webrtcbin 'sendrecv' en la pipeline.")
            sys.exit(1)

        # Conectar señales
        webrtc.connect("on-negotiation-needed", on_negotiation_needed)
        webrtc.connect("on-ice-candidate", on_ice_candidate)
        # webrtc.connect("pad-added", on_incoming_stream) # Descomentado, solo enviamos

        pipeline.set_state(Gst.State.PLAYING)
        print(f"[{CAMERA_ID}] Pipeline iniciada. Esperando conexión de señalización...")
    except Exception as e:
        print(f"[{CAMERA_ID}] Error al crear o iniciar la pipeline: {e}")
        sys.exit(1)


if __name__ == "__main__":
    start_pipeline()
    try:
        print(f"[{CAMERA_ID}] Conectando a {SIGNALING_SERVER}...")
        sio.connect(SIGNALING_SERVER, transports=['websocket']) # Websocket suele ser más fiable
    except socketio.exceptions.ConnectionError as e:
        print(f"[{CAMERA_ID}] No se pudo conectar al servidor de señalización: {e}")
        if pipeline:
          pipeline.set_state(Gst.State.NULL)
        sys.exit(1)

    loop = GLib.MainLoop()
    try:
        loop.run()
    except KeyboardInterrupt:
        print(f"[{CAMERA_ID}] Deteniendo...")
    finally:
        if sio.connected:
            sio.disconnect()
        if pipeline:
            pipeline.set_state(Gst.State.NULL)
        print(f"[{CAMERA_ID}] Limpieza completa. Adiós.")