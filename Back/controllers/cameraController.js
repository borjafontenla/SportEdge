// backend/controllers/cameraController.js

const request = require('request');

// Configuración de la cámara (ajusta estos valores según tu cámara)
const CAM_IP = "169.254.79.248";  // IP de la cámara
const CAM_PORT = "80";            // Puerto HTTP (puede ser 80 o 8080)
const STREAM_PATH = "video.mjpg"; // Nombre del stream MJPEG

exports.getCameraStream = (req, res) => {
  // Usamos credenciales fijas
  const username = "root";
  const password = "V9cVi3URKNQxdFd";

  // Construimos la URL base sin incrustar las credenciales
  const cameraUrl = `http://${CAM_IP}:${CAM_PORT}/${STREAM_PATH}`;
  console.log("Proxying stream desde:", cameraUrl);

  // Realizamos la petición GET usando la opción auth para enviar las credenciales
  request.get({
    url: cameraUrl,
    auth: {
      user: username,
      pass: password,
      sendImmediately: true
    }
  })
    .on('response', (response) => {
      console.log("Respuesta del stream:", response.statusCode);
      if (response.statusCode === 400) {
        console.error("Error 400: Bad Request");
      }
    })
    .on('error', (err) => {
      console.error("Error en el stream de la cámara:", err);
      res.status(500).send("Error al conectarse a la cámara");
    })
    .pipe(res);
};
