const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Network IP detection helper
function getLocalNetworkAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  return addresses;
}

app.get('/api/network-info', (req, res) => {
  res.json({
    port: PORT,
    localIps: getLocalNetworkAddresses()
  });
});

// Party Rooms Map: roomCode -> Set of socket IDs
const rooms = new Map();

io.on('connection', (socket) => {
  let currentRoom = null;

  socket.on('joinRoom', ({ code, name }, callback) => {
    const roomCode = (code || '').toUpperCase().trim();
    if (!rooms.has(roomCode)) {
      rooms.set(roomCode, new Set());
    }
    const roomSet = rooms.get(roomCode);
    roomSet.add(socket.id);
    socket.join(roomCode);
    currentRoom = roomCode;

    console.log(`[Party] ${name || 'Player'} (${socket.id}) joined room ${roomCode}`);

    if (typeof callback === 'function') {
      callback({ success: true, roomCode });
    }
  });

  socket.on('playerMove', (data) => {
    if (data.room) {
      socket.to(data.room).emit('playerMoved', {
        id: socket.id,
        x: data.x,
        y: data.y,
        color: data.color
      });
    }
  });

  socket.on('playerFinishedLevel', (data) => {
    if (data.room) {
      socket.to(data.room).emit('opponentWon', {
        id: socket.id,
        level: data.level,
        time: data.time
      });
    }
  });

  socket.on('disconnect', () => {
    if (currentRoom && rooms.has(currentRoom)) {
      const roomSet = rooms.get(currentRoom);
      roomSet.delete(socket.id);
      if (roomSet.size === 0) {
        rooms.delete(currentRoom);
      } else {
        socket.to(currentRoom).emit('playerLeft', { id: socket.id });
      }
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🎮 THE COLOR: Precision 2D Platformer Server Running!`);
  console.log(`🚀 Local URL:        http://localhost:${PORT}`);
  const ips = getLocalNetworkAddresses();
  ips.forEach(ip => {
    console.log(`🌐 Local Wi-Fi URL:  http://${ip}:${PORT}`);
  });
  console.log(`======================================================\n`);
});
