// backend/api/cameraService.js
const request = require('request');

const CAM_IP = "169.254.79.248";
const CAM_PORT = "80";
const USERNAME = "root";
const PASSWORD = "V9cVi3URKNQxdFd";

/**
 * Envía un comando PTZ a la cámara.
 * Los comandos aceptados son 'zoom_in' y 'zoom_out'.
 * Para 'zoom_in' se usará el parámetro zoom=tele y para 'zoom_out', zoom=wide.
 */
const sendPTZCommand = (command) => {
  let zoomParam;
  if (command === 'zoom_in') {
    zoomParam = 'tele';
  } else if (command === 'zoom_out') {
    zoomParam = 'wide';
  } else {
    return Promise.reject(new Error('Comando PTZ desconocido'));
  }

  // Usamos el endpoint de la cámara que se observa en la solicitud oficial
  const endpoint = '/cgi-bin/camctrl/eCamCtrl.cgi';

  // Incluimos parámetros adicionales, incluyendo un timestamp (útil para evitar caché)
  const query = {
    channel: '0',
    stream: '0',
    zoom: zoomParam,
    _: Date.now() // timestamp
  };

  // Construir la cadena de consulta
  const queryString = Object.keys(query)
    .map(key => `${key}=${encodeURIComponent(query[key])}`)
    .join('&');

  // Construir la URL completa con autenticación básica incluida en la URL
  const ptzUrl = `http://${USERNAME}:${PASSWORD}@${CAM_IP}:${CAM_PORT}${endpoint}?${queryString}`;
  console.log("Enviando comando PTZ a:", ptzUrl);

  // Opciones que replican los encabezados enviados por la interfaz oficial
  const options = {
    url: ptzUrl,
    headers: {
      "Referer": "http://169.254.79.248/index.html",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0",
      "X-Requested-With": "XMLHttpRequest",
      "Cookie": "webptzmode=continuous; activatedmode=digital; g_mode=1; viewsizemode=Auto; 4x3=false; imageprofileindex=0; TmpImageNormalLightEnable=0; sensorprofileindex=0; TmpVideoNormalLightEnable=0"
    }
  };

  return new Promise((resolve, reject) => {
    request.get(options, (error, response, body) => {
      if (error) {
        console.error("Error en el comando PTZ:", error);
        return reject(error);
      }
      console.log("Respuesta del comando PTZ:", response.statusCode, body);
      if (response.statusCode === 200) {
        resolve({ success: true, body });
      } else {
        reject(new Error(`Error en PTZ, código: ${response.statusCode} - ${body}`));
      }
    });
  });
};

module.exports = { sendPTZCommand };
