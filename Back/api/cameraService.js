// backend/api/cameraService.js

const request = require('request');

// Datos de la cámara para PTZ
const CAM_IP = "169.254.79.248";
const CAM_PORT = "80";
const USERNAME = "root";
const PASSWORD = "V9cVi3URKNQxdFd";

// Endpoint PTZ (ajusta según la documentación de tu cámara)
const PTZ_ENDPOINT = "/cgi-bin/ptz.cgi?action=control&channel=0";

/**
 * Envía un comando PTZ a la cámara.
 * @param {string} command - Comando PTZ a enviar (ej. 'pan_left', 'tilt_up', etc.)
 * @returns {Promise} - Promesa que se resuelve si el comando se envía correctamente.
 */
function sendPTZCommand(command) {
  const ptzUrl = `http://${USERNAME}:${PASSWORD}@${CAM_IP}:${CAM_PORT}${PTZ_ENDPOINT}&cmd=${command}&speed=1`;
  console.log("Enviando comando PTZ a:", ptzUrl);

  return new Promise((resolve, reject) => {
    request.get(ptzUrl, (error, response, body) => {
      if (error) {
        console.error("Error en el comando PTZ:", error);
        return reject(error);
      }
      if (response.statusCode === 200) {
        console.log("Comando PTZ ejecutado correctamente:", body);
        resolve({ success: true, body });
      } else {
        console.error("Error en PTZ, código:", response.statusCode);
        reject(new Error(`Error en PTZ, código: ${response.statusCode}`));
      }
    });
  });
}

module.exports = { sendPTZCommand };
