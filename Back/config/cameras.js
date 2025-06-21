// back/config/cameras.js

require('dotenv').config();

const cameras = [];

// Busca cámaras MIPI definidas en .env (CAM1, CAM2, ..., CAMN)
let i = 1;
while (process.env[`CAM${i}_ID`]) {
  const id = process.env[`CAM${i}_ID`];
  cameras.push({
    id: id,
    name: process.env[`CAM${i}_NAME`] || `Cámara MIPI ${i}`,
    // El dato más importante ahora es el sensor-id
    sensorId: parseInt(process.env[`CAM${i}_SENSOR_ID`], 10),
  });
  i++;
}

// Validación crucial
if (cameras.some(cam => isNaN(cam.sensorId))) {
  console.error("ERROR: Una o más cámaras tienen un CAM_SENSOR_ID inválido o no definido en el archivo .env. Este valor es obligatorio.");
  process.exit(1);
}

if (cameras.length === 0) {
  console.warn("Advertencia: No se encontraron configuraciones de cámara MIPI en el archivo .env (formato CAM1_ID, CAM1_SENSOR_ID, etc.)");
}

const getCameraConfigById = (cameraId) => {
  return cameras.find(cam => cam.id === cameraId);
};

module.exports = {
  cameras,
  getCameraConfigById,
};