require('dotenv').config();

const cameras = [];

// Busca cámaras definidas en .env (CAM1, CAM2, ..., CAMN)
let i = 1;
while (process.env[`CAM${i}_ID`]) {
  const id = process.env[`CAM${i}_ID`];
  cameras.push({
    id: id,
    ip: process.env[`CAM${i}_IP`],
    port: process.env[`CAM${i}_PORT`] || 80,
    user: process.env[`CAM${i}_USER`],
    pass: process.env[`CAM${i}_PASS`],
    rtspUrl: process.env[`CAM${i}_RTSP_URL`],
    mjpegPath: process.env[`CAM${i}_MJPEG_PATH`], // Opcional
  });
  i++;
}

if (cameras.length === 0) {
  console.warn("Advertencia: No se encontraron configuraciones de cámara en el archivo .env (formato CAM1_ID, CAM1_IP, etc.)");
}

const getCameraConfigById = (cameraId) => {
  return cameras.find(cam => cam.id === cameraId);
};

module.exports = {
  cameras,
  getCameraConfigById,
};