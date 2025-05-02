const express = require('express');
const router = express.Router();
const { sendPTZCommand } = require('../api/cameraService'); // Corregido nombre
const { getCameraConfigById } = require('../config/cameras');

// Endpoint para listar cámaras disponibles (opcional pero útil)
router.get('/', (req, res) => {
  const cameraList = require('../config/cameras').cameras.map(c => ({ id: c.id, ip: c.ip })); // No exponer credenciales
  res.json(cameraList);
});

// Endpoint para comandos PTZ por ID de cámara
// Ejemplo: GET /api/cameras/cam1/ptz?command=zoom_in
router.get('/:cameraId/ptz', async (req, res) => {
  const { cameraId } = req.params;
  const { command } = req.query;

  if (!command) {
    return res.status(400).json({ error: "Falta el parámetro 'command'" });
  }

  // Verificar si la cámara existe
  if (!getCameraConfigById(cameraId)) {
      return res.status(404).json({ error: `Cámara con ID '${cameraId}' no encontrada.` });
  }

  try {
    const result = await sendPTZCommand(cameraId, command);
    res.json(result);
  } catch (err) {
    // Determinar el código de estado adecuado basado en el error
    const statusCode = err.message.includes('autenticación') ? 401 : (err.message.includes('desconocido') ? 400 : 500);
    res.status(statusCode).json({ error: err.message });
  }
});

// Podrías añadir aquí la ruta para el proxy MJPEG si aún la necesitas
// GET /api/cameras/:cameraId/mjpeg
// Similar al PTZ, obtén config, construye URL, usa axios con responseType: 'stream' y haz pipe a res.

module.exports = router;