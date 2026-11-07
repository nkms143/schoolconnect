import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt.js';

interface ConnectedUser {
  userId: string;
  socketId: string;
}

const onlineUsers = new Map<string, string>(); // userId -> socketId

export const setupSocketHandlers = (io: SocketIOServer) => {
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(); // allow guest connection or handle authentication
    }

    const decoded = verifyToken(String(token));
    if (decoded) {
      (socket as any).userId = decoded.userId;
      (socket as any).userRole = decoded.role;
    }
    next();
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;

    if (userId) {
      onlineUsers.set(userId, socket.id);
      io.emit('online_users', Array.from(onlineUsers.keys()));
      console.log(`🔌 User connected: ${userId} (${socket.id})`);
    }

    socket.on('register_user', (id: string) => {
      if (id) {
        onlineUsers.set(id, socket.id);
        (socket as any).userId = id;
        io.emit('online_users', Array.from(onlineUsers.keys()));
      }
    });

    socket.on('get_online_users', () => {
      socket.emit('online_users', Array.from(onlineUsers.keys()));
    });

    socket.on('private_message', (data: { receiverId: string; message: any }) => {
      const recipientSocketId = onlineUsers.get(data.receiverId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('receive_message', data.message);
      }
    });

    socket.on('typing_start', (data: { receiverId: string; senderName?: string }) => {
      const recipientSocketId = onlineUsers.get(data.receiverId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('user_typing', {
          senderId: userId || (socket as any).userId,
          senderName: data.senderName
        });
      }
    });

    socket.on('typing_stop', (data: { receiverId: string }) => {
      const recipientSocketId = onlineUsers.get(data.receiverId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('user_stopped_typing', {
          senderId: userId || (socket as any).userId
        });
      }
    });

    socket.on('disconnect', () => {
      if (userId && onlineUsers.get(userId) === socket.id) {
        onlineUsers.delete(userId);
        io.emit('online_users', Array.from(onlineUsers.keys()));
        console.log(`🔌 User disconnected: ${userId}`);
      }
    });
  });
};

export const getOnlineUsersList = (): string[] => {
  return Array.from(onlineUsers.keys());
};
