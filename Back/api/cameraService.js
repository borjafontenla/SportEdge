const axios = require('axios');
const { getCameraConfigById } = require('../config/cameras');

// Mantiene los comandos internos para compatibilidad con la API de Vivotek
const PTZ_COMMAND_MAP = {
  zoom_in: 'tele',
  zoom_out: 'wide',
  // Puedes añadir más aquí si la cámara los soporta:
  // 'move_up': 'up', 'move_down': 'down', 'move_left': 'left', 'move_right': 'right', 'stop': 'stop'
};

/**
 * Envía un comando PTZ a la cámara especificada.
 */
const sendPTZCommand = async (cameraId, command) => {
  const config = getCameraConfigById(cameraId);
  if (!config) {
    throw new Error(`Configuración no encontrada para la cámara: ${cameraId}`);
  }

  const zoomOrMoveParam = PTZ_COMMAND_MAP[command];
  if (!zoomOrMoveParam) {
    throw new Error(`Comando PTZ desconocido o no mapeado: ${command}`);
  }

  // Determina si es un comando de zoom o movimiento (si añades más)
  const isZoomCommand = command.startsWith('zoom_');
  const paramName = isZoomCommand ? 'zoom' : 'move'; // Asume 'move' para otros comandos

  const endpoint = '/cgi-bin/camctrl/eCamCtrl.cgi'; // Endpoint común para Vivotek PTZ
  const params = {
    channel: '0', // Generalmente 0
    stream: '0',  // Generalmente 0
    [paramName]: zoomOrMoveParam, // Nombre de parámetro dinámico
    _: Date.now() // Cache buster
  };

  const ptzUrl = `http://${config.ip}:${config.port}${endpoint}`;
  console.log(`[${cameraId}] Enviando comando PTZ: ${command} a ${ptzUrl}`);

  try {
    const response = await axios.get(ptzUrl, {
      params: params,
      auth: {
        username: config.user,
        password: config.pass
      },
      // Headers: Reduce al mínimo necesario. A menudo, solo la autenticación es suficiente.
      // headers: {
      //   "Referer": `http://${config.ip}/`, // Referer genérico suele bastar
      //   "User-Agent": "CameraControlBackend/1.0", // Opcional: Identifica tu app
      // }
    });

    console.log(`[${cameraId}] Respuesta del comando PTZ: ${response.status}`);
    if (response.status === 200) {
      return { success: true, message: `Comando ${command} enviado a ${cameraId}` };
    } else {
      // Axios suele lanzar error para >2xx, pero por si acaso
      throw new Error(`Respuesta inesperada del PTZ: ${response.status}`);
    }
  } catch (error) {
    const status = error.response?.status;
    const data = error.response?.data;
    console.error(`[${cameraId}] Error en el comando PTZ: ${status || error.message}`, data || '');
    if (status === 401) {
      throw new Error(`Error de autenticación PTZ para ${cameraId}. Verifica usuario/contraseña.`);
    }
    throw new Error(`Error al enviar comando PTZ a ${cameraId}: ${status || error.message}`);
  }
};

// Ya no necesitamos las funciones de HLS/WebRTC aquí si las maneja el server principal o servicios dedicados
module.exports = { sendPTZCommand };