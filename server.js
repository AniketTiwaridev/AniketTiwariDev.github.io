onst express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors'); // Add this line

const app = express();
app.use(cors()); // Add this line

const server = http.createServer(app);
const io = socketIo(server);
const server = http.createServer(app);
const io = socketIo(server);

const rooms = new Map();

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (data) => {
    const { password } = data;

    // Check if the room exists
    if (!rooms.has(password)) {
      rooms.set(password, new Set());
    }

    // Add the new user to the room
    rooms.get(password).add(socket.id);

    // Broadcast to all clients in the room that a new user has joined
    rooms.get(password).forEach((clientId) => {
      if (clientId !== socket.id) {
        io.to(clientId).emit('message', { type: 'user-joined', userId: socket.id });
      }
    });

    // Send the list of participants to the new user
    const participants = Array.from(rooms.get(password));
    socket.emit('participants', { participants });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    // Remove the user from all rooms they were part of
    rooms.forEach((participants, password) => {
      if (participants.has(socket.id)) {
        participants.delete(socket.id);

        // Broadcast to all remaining clients in the room that a user has left
        participants.forEach((clientId) => {
          io.to(clientId).emit('message', { type: 'user-left', userId: socket.id });
        });

        // If the room is empty, remove it
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
