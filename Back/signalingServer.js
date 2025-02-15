// backend/signalingServer.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'  // Ajusta según tus necesidades de seguridad
  }
});

io.on('connection', socket => {
  console.log('Un usuario se conectó: ', socket.id);

  // Cuando se recibe un mensaje de señalización, se reenvía a todos los demás
  socket.on('signal', data => {
    console.log('Mensaje de señal desde', socket.id, data);
    socket.broadcast.emit('signal', data);
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado: ', socket.id);
  });
});

const PORT = 5001;
server.listen(PORT, () => {
  console.log(`Servidor de señalización corriendo en el puerto ${PORT}`);
});
