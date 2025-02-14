const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');

const cameraRoutes = require('./routes/camera');
const { startHlsConversion } = require('./api/hlsService');

const app = express();

app.use(cors());
app.use(morgan('dev'));

// Servir la carpeta HLS de forma estática
app.use('/hls', express.static(path.join(__dirname, 'hls')));

// Rutas para la cámara (por ejemplo, PTZ u otros comandos)
app.use('/api/camera', cameraRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Inicia la conversión a HLS
  startHlsConversion();
});
