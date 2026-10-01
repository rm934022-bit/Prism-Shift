const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const os = require('os');
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, 'public')));
function getLocalNetworkAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (let name in interfaces) {
    for (let i = 0; i < interfaces[name].length; i++) {
      let iface = interfaces[name][i];
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  return addresses;
}
app.get('/api/network-info', function(req, res) {
  res.json({
    port: PORT,
    localIps: getLocalNetworkAddresses()
  });
});
const rooms = {};
io.on('connection', function(socket) {
  let currentRoom = null;
  socket.on('joinRoom', function(data, callback) {
    let roomCode = '';
    if (data && data.code) {
      roomCode = data.code.toUpperCase().trim();
    }
    if (!rooms[roomCode]) {
      rooms[roomCode] = [];
    }
    rooms[roomCode].push(socket.id);
    socket.join(roomCode);
    currentRoom = roomCode;
    if (callback) {
      callback({ success: true, roomCode: roomCode });
    }
  });
  socket.on('playerMove', function(data) {
    if (data && data.room) {
      socket.to(data.room).emit('playerMoved', {
        id: socket.id,
        x: data.x,
        y: data.y,
        color: data.color
      });
    }
  });
  socket.on('playerFinishedLevel', function(data) {
    if (data && data.room) {
      socket.to(data.room).emit('opponentWon', {
        id: socket.id,
        level: data.level,
        time: data.time
      });
    }
  });
  socket.on('disconnect', function() {
    if (currentRoom && rooms[currentRoom]) {
      rooms[currentRoom] = rooms[currentRoom].filter(function(id) {
        return id !== socket.id;
      });
      if (rooms[currentRoom].length === 0) {
        delete rooms[currentRoom];
      } else {
        socket.to(currentRoom).emit('playerLeft', { id: socket.id });
      }
    }
  });
});
server.listen(PORT, '0.0.0.0', function() {
  console.log('Game server running on port ' + PORT);
});
