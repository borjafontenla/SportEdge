#!/usr/bin/env python3
import gi
gi.require_version('Gst', '1.0')
gi.require_version('GstWebRTC', '1.0')
gi.require_version('GstSdp', '1.0')
from gi.repository import Gst, GstWebRTC, GstSdp, GLib
import socketio

# Inicializa GStreamer
Gst.init(None)

# Configura el cliente Socket.IO
sio = socketio.Client()

@sio.event
def connect():
    print("Conectado al signaling server")

@sio.event
def disconnect():
    print("Desconectado del signaling server")

# Cuando se reciba una señal (por ejemplo, la respuesta SDP) desde el servidor
@sio.on('signal')
def on_signal(data):
    print("Señal recibida desde el servidor:", data)
    # Se espera que 'data' sea un diccionario con keys 'sdp' y 'type'
    sdp_text = data.get('sdp')
    sdp_type = data.get('type')  # 'answer' o 'offer'
    if sdp_text and sdp_type:
        # Parsear el SDP recibido usando GstSdp
        sdp_msg = GstSdp.SDPMessage.new()
        ret, sdp_msg = GstSdp.sdp_message_parse_buffer(sdp_text.encode('utf-8'))
        if ret != GstSdp.SDPResult.OK:
            print("Error al parsear SDP:", ret)
            return
        # Crear una sesión de descripción SDP para WebRTC
        session_description = GstWebRTC.WebRTCSessionDescription.new(sdp_type, sdp_msg)
        # Establecer la descripción remota en webrtcbin
        webrtc.emit("set-remote-description", session_description, None)
        print("Descripción remota configurada.")

@sio.event
def on_error(err):
    print("Error en Socket.IO:", err)

# Conecta al signaling server (ajusta la URL si es necesario)
sio.connect('http://localhost:5001')

# Define la pipeline de GStreamer como un string
pipeline_str = '''
  rtspsrc location="rtsp://root:V9cVi3URKNQxdFd@169.254.79.248:554/live.sdp" name=src !
  decodebin !
  videoconvert !
  videoscale !
  video/x-raw,width=640,height=480 !
  queue !
  vp8enc deadline=1 !
  rtpvp8pay pt=96 !
  webrtcbin name=sendrecv stun-server=stun://stun.l.google.com:19302
'''

# Crea la pipeline y obtiene el elemento webrtcbin
pipeline = Gst.parse_launch(pipeline_str)
webrtc = pipeline.get_by_name("sendrecv")

# Callback para cuando se necesita negociar (crear oferta SDP)
def on_negotiation_needed(element):
    print("Negociación necesaria, creando oferta SDP...")
    promise = Gst.Promise.new_with_change_func(offer_created, element, None)
    element.emit("create-offer", None, promise)

# Callback que se invoca cuando se crea la oferta
def offer_created(promise, element, user_data):
    reply = promise.get_reply()
    offer = reply.get_value("offer")
    sdp_text = offer.sdp.as_text()
    print("Oferta SDP creada:\n", sdp_text)
    # Establecer la descripción local en webrtcbin
    element.emit("set-local-description", offer, None)
    # Enviar la oferta SDP al signaling server para que el front-end (u otro peer) la reciba
    sio.emit('signal', {'sdp': sdp_text, 'type': 'offer'})

# Conecta el evento "on-negotiation-needed" del webrtcbin
webrtc.connect("on-negotiation-needed", on_negotiation_needed)

# Inicia la pipeline y corre el main loop de GLib para mantener el proceso vivo
pipeline.set_state(Gst.State.PLAYING)
print("Pipeline en ejecución...")
GLib.MainLoop().run()
