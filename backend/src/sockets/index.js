const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const logger = require('../core/utils/logger');

let io = null;

function initSocket(httpServer) {
  io = new Server(httpServer, {
    path: '/realtime',
    cors: { origin: env.clientUrl, credentials: true },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next();
      const decoded = jwt.verify(token, env.jwtSecret);
      socket.userId = decoded.sub;
      next();
    } catch (err) {
      next(); // treat invalid token as anonymous rather than hard-failing the socket
    }
  });

  io.on('connection', (socket) => {
    logger.info(`[socket] connected: ${socket.id}${socket.userId ? ` (user ${socket.userId})` : ''}`);
    socket.join('dashboard');
    socket.on('disconnect', () => logger.info(`[socket] disconnected: ${socket.id}`));
  });

  return io;
}

function emitDetectionNew(detection) {
  if (io) io.to('dashboard').emit('detection_new', detection);
}

function emitNotificationNew(notification) {
  if (io) io.to('dashboard').emit('notification_new', notification);
}

function emitCameraStatusChange(cameraId, newStatus) {
  if (io) io.to('dashboard').emit('camera_status_change', { cameraId, newStatus });
}

module.exports = { initSocket, emitDetectionNew, emitNotificationNew, emitCameraStatusChange };
