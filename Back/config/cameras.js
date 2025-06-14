// back/routes/cameras.js

const express = require('express');
const router = express.Router();
const { getCameraStream } = require('../controllers/cameraController'); // Nombre de función actualizado
const { cameras, getCameraConfigById } = require('../config/cameras');

// Endpoint para listar las cámaras MIPI configuradas
router.get('/', (req, res) => {
  const cameraList = cameras.map(c => ({ id: c.id, name: c.name, sensorId: c.sensorId }));
  res.json(cameraList);
});

// NUEVO: Endpoint para el stream MJPEG bajo demanda
// Ejemplo: GET /api/cameras/cam-csi-0/mjpeg
router.get('/:cameraId/mjpeg', getCameraStream);

// ELIMINADO: La ruta PTZ ya no es aplicable a cámaras MIPI
// router.get('/:cameraId/ptz', ...);

module.exports = router;