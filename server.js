const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server); // Inicializa Socket.IO con el servidor HTTP

app.use(express.static('public')); // Sirve archivos estáticos si tienes una carpeta 'public'

io.on('connection', (socket) => {
  console.log('Nuevo usuario conectado:', socket.id);

  // Escucha eventos personalizados del cliente
  socket.on('mensaje', (data) => {
    console.log(`Mensaje recibido: ${data}`);
    io.emit('mensaje', data); // Reenvía el mensaje a todos los clientes conectados
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
