const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const onlineUsers = new Map();

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
      credentials: true,
    },
  });

  // Auth-middleware: körs innan en anslutning tillåts
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Ingen token skickad'));
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = payload.userId;
      socket.username = payload.username;
      next();
    } catch (err) {
      next(new Error('Ogiltig eller utgången token'));
    }
  });

  io.on('connection', (socket) => {
    onlineUsers.set(socket.userId, socket.id);
    console.log(`${socket.username} anslöt (userId: ${socket.userId})`);

    socket.on('disconnect', () => {
      if (onlineUsers.get(socket.userId) === socket.id) {
        onlineUsers.delete(socket.userId);
      }
      console.log(`${socket.username} kopplade från`);
    });
  });

  return io;
}

module.exports = { initSocket, onlineUsers };