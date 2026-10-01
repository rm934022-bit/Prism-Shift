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
function getRoomPlayers(code) {
  if (!rooms[code]) return [];
  const list = [];
  for (let id in rooms[code].players) {
    list.push(rooms[code].players[id]);
  }
  return list;
}
io.on('connection', function(socket) {
  let currentRoom = null;
  socket.on('createRoom', function(data, callback) {
    let chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    rooms[code] = {
      code: code,
      host: socket.id,
      level: 1,
      players: {}
    };
    rooms[code].players[socket.id] = {
      id: socket.id,
      name: (data && data.name) ? data.name : 'Host',
      isHost: true,
      ready: true
    };
    socket.join(code);
    currentRoom = code;
    if (callback) {
      callback({
        success: true,
        code: code,
        isHost: true,
        level: rooms[code].level,
        players: getRoomPlayers(code)
      });
    }
  });
  socket.on('joinRoom', function(data, callback) {
    let code = (data && data.code) ? data.code.toUpperCase().trim() : '';
    if (!rooms[code]) {
      if (callback) {
        callback({ success: false, message: 'Room not found. Check the 4-letter code!' });
      }
      return;
    }
    rooms[code].players[socket.id] = {
      id: socket.id,
      name: (data && data.name) ? data.name : 'Player 2',
      isHost: false,
      ready: true
    };
    socket.join(code);
    currentRoom = code;
    if (callback) {
      callback({
        success: true,
        code: code,
        isHost: rooms[code].host === socket.id,
        level: rooms[code].level,
        players: getRoomPlayers(code)
      });
    }
    io.to(code).emit('roomUpdate', {
      code: code,
      host: rooms[code].host,
      level: rooms[code].level,
      players: getRoomPlayers(code)
    });
  });
  socket.on('selectLevel', function(data) {
    if (currentRoom && rooms[currentRoom] && rooms[currentRoom].host === socket.id) {
      rooms[currentRoom].level = data.level;
      io.to(currentRoom).emit('levelChanged', { level: data.level });
    }
  });
  socket.on('startRace', function() {
    if (currentRoom && rooms[currentRoom] && rooms[currentRoom].host === socket.id) {
      io.to(currentRoom).emit('raceStarting', {
        level: rooms[currentRoom].level,
        countdown: 3
      });
    }
  });
  socket.on('playerMove', function(data) {
    if (currentRoom && rooms[currentRoom]) {
      let pName = rooms[currentRoom].players[socket.id] ? rooms[currentRoom].players[socket.id].name : 'Racer';
      socket.to(currentRoom).emit('playerMoved', {
        id: socket.id,
        name: pName,
        x: data.x,
        y: data.y,
        color: data.color,
        facing: data.facing || 1,
        scaleX: data.scaleX || 1,
        scaleY: data.scaleY || 1,
        vx: data.vx || 0,
        vy: data.vy || 0
      });
    }
  });
  socket.on('playerFinishedLevel', function(data) {
    if (currentRoom && rooms[currentRoom]) {
      io.to(currentRoom).emit('playerWon', {
        id: socket.id,
        name: rooms[currentRoom].players[socket.id] ? rooms[currentRoom].players[socket.id].name : 'Racer',
        level: data.level,
        time: data.time
      });
    }
  });
  socket.on('leaveRoom', function() {
    if (currentRoom && rooms[currentRoom]) {
      let rCode = currentRoom;
      delete rooms[rCode].players[socket.id];
      let remaining = getRoomPlayers(rCode);
      if (remaining.length === 0) {
        delete rooms[rCode];
      } else {
        if (rooms[rCode].host === socket.id) {
          rooms[rCode].host = remaining[0].id;
          remaining[0].isHost = true;
        }
        io.to(rCode).emit('roomUpdate', {
          code: rCode,
          host: rooms[rCode].host,
          level: rooms[rCode].level,
          players: remaining
        });
        io.to(rCode).emit('playerLeft', { id: socket.id });
      }
      socket.leave(rCode);
      currentRoom = null;
    }
  });
  socket.on('disconnect', function() {
    if (currentRoom && rooms[currentRoom]) {
      let rCode = currentRoom;
      delete rooms[rCode].players[socket.id];
      let remaining = getRoomPlayers(rCode);
      if (remaining.length === 0) {
        delete rooms[rCode];
      } else {
        if (rooms[rCode].host === socket.id) {
          rooms[rCode].host = remaining[0].id;
          remaining[0].isHost = true;
        }
        io.to(rCode).emit('roomUpdate', {
          code: rCode,
          host: rooms[rCode].host,
          level: rooms[rCode].level,
          players: remaining
        });
        io.to(rCode).emit('playerLeft', { id: socket.id });
      }
      currentRoom = null;
    }
  });
});
server.listen(PORT, '0.0.0.0', function() {
  console.log('Game server running on port ' + PORT);
});
