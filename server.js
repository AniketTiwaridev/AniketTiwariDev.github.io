const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server);

const rooms = new Map();

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (data) => {
    const { password } = data;

    if (!rooms.has(password)) {
      rooms.set(password, new Set());
    }

    rooms.get(password).add(socket.id);

    rooms.get(password).forEach((clientId) => {
      if (clientId !== socket.id) {
        io.to(clientId).emit('message', { type: 'user-joined', userId: socket.id });
      }
    });

    const participants = Array.from(rooms.get(password));
    socket.emit('participants', { participants });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    rooms.forEach((participants, password) => {
      if (participants.has(socket.id)) {
        participants.delete(socket.id);

        participants.forEach((clientId) => {
          io.to(clientId).emit('message', { type: 'user-left', userId: socket.id });
        });

        if (participants.size === 0) {
          rooms.delete(password);
        }
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
