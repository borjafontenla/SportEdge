// back/routes/cameras.js

const express = require('express');
const router = express.Router();
// Importamos el controlador correcto
const { getMjpegStream } = require('../controllers/cameraController');
const { cameras } = require('../config/cameras');

// Endpoint para listar las cámaras MIPI configuradas
// Ruta: GET /api/cameras/
router.get('/', (req, res) => {
  const cameraList = cameras.map(c => ({ id: c.id, name: c.name, sensorId: c.sensorId }));
  res.json(cameraList);
});

// Endpoint para el stream MJPEG bajo demanda
// Ruta: GET /api/cameras/cam-csi-0/mjpeg
router.get('/:cameraId/mjpeg', getMjpegStream);

// El PTZ fue eliminado, ya no hay más rutas aquí.

module.exports = router;