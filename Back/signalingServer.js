require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:3000'];
console.log("Orígenes CORS permitidos:", allowedOrigins);

const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Permitir solicitudes sin origen (como Postman, apps móviles) o si está en la lista blanca
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn(`Origen CORS bloqueado: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"]
  }
});

io.on('connection', socket => {
  console.log(`Usuario conectado: ${socket.id}`);

  // Unirse a una sala (opcional, pero bueno para escalar)
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} se unió a la sala ${roomId}`);
  });

  // Reenvío de señales: puede ser broadcast o dirigido a una sala
  socket.on('signal', data => {
    // Extraer ID de cámara si se envía para dirigir la señal
    const targetCameraId = data?.cameraId; // Asume que GStreamer/Frontend lo añade

    console.log(`Mensaje de señal desde ${socket.id}. Target: ${targetCameraId || 'Broadcast'}. Tipo: ${data?.type || data?.candidate?.substring(0,15) || 'Desconocido'}`);

    // Reenviar a todos excepto al emisor
    // Si usas salas, podrías enviar solo a la sala: io.to(targetCameraId).emit('signal', data);
    socket.broadcast.emit('signal', data); // Broadcast simple por ahora
  });

  socket.on('disconnect', () => {
    console.log(`Usuario desconectado: ${socket.id}`);
  });

  socket.on('connect_error', (err) => {
    console.error(`Error de conexión de Socket.IO: ${err.message}`);
  });
});

const PORT = process.env.SIGNALING_PORT || 5001;
server.listen(PORT, () => {
  console.log(`Servidor de señalización corriendo en el puerto ${PORT}`);
});