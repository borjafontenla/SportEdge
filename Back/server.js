const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');

// Rutas de la cámara (por ejemplo, para PTZ u otros comandos)
const cameraRoutes = require('./routes/camera');

// Importa el servicio HLS
const { startHlsConversion } = require('./api/hlsService');

const app = express();

app.use(cors());
app.use(morgan('dev'));

// Sirve la carpeta hls de forma estática
app.use('/hls', express.static(path.join(__dirname, 'hls')));

// Rutas para la cámara
app.use('/api/camera', cameraRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Inicia la conversión HLS
  startHlsConversion();
});
