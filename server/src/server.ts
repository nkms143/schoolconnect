import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app.js';
import { ENV } from './config/env.js';
import { setupSocketHandlers } from './services/socketService.js';

const app = createApp();
const server = http.createServer(app);

// Setup Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, callback) => {
      callback(null, true);
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

setupSocketHandlers(io);

const PORT = ENV.PORT;

server.listen(PORT, () => {
  console.log(`======================================================`);
  console.log(`🚀 SchoolConnect Server running on port ${PORT}`);
  console.log(`📡 Socket.IO Real-time service attached`);
  console.log(`🌐 Environment: ${ENV.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`======================================================`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated.');
  });
});
