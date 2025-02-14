// backend/server.js

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const cameraRoutes = require('./routes/camera');

const app = express();

app.use(cors());
app.use(morgan('dev'));

// Rutas para la cámara
app.use('/api/camera', cameraRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
