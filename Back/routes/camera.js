const express = require('express');
const router = express.Router();
const { sendPTZCommand } = require('../api/cameraService');

// Endpoint para comandos PTZ
// Ejemplo: GET /api/camera/ptz?command=zoom_in
router.get('/ptz', (req, res) => {
  const command = req.query.command;
  if (!command) {
    return res.status(400).json({ error: "Falta el comando PTZ" });
  }

  sendPTZCommand(command)
    .then(result => res.json(result))
    .catch(err => res.status(500).json({ error: err.message }));
});

module.exports = router;
