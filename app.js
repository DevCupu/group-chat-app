const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'chat.html'));
});

// Active users
const users = {};

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected');

  // When a new user joins, assign a username
  socket.on('new user', (username) => {
    users[socket.id] = username;
    socket.broadcast.emit('user connected', `${username} has joined the chat`);
    console.log(`${username} connected`);
  });

  // Handle incoming chat messages
  socket.on('chat message', (data) => {
    io.emit('chat message', { user: users[socket.id], message: data });
  });

  // Notify when a user is typing
  socket.on('typing', () => {
    socket.broadcast.emit('typing', users[socket.id]);
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    const username = users[socket.id];
    delete users[socket.id];
    if (username) {
      io.emit('user disconnected', `${username} has left the chat`);
      console.log(`${username} disconnected`);
    }
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
