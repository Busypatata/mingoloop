import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';

let io = null;

// Maps a userId (string) -> their current socket id.
// A user is "online" if and only if they have an entry here.
const onlineUsers = new Map();

export function getIO() {
  return io;
}

export function getSocketForUser(userId) {
  return onlineUsers.get(userId);
}

export function isUserOnline(userId) {
  return onlineUsers.has(userId);
}

export function initSockets(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    },
  });

  // Authenticate every socket connection using the same JWT the REST API uses.
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Not authorized'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('Not authorized'));

      socket.userId = user._id.toString();
      next();
    } catch (error) {
      next(new Error('Not authorized'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    onlineUsers.set(userId, socket.id);
    io.emit('user_online', { userId });

    socket.on('disconnect', () => {
      // Only clear the entry if it's still this socket — avoids a race
      // where a user reconnects on a new tab just as the old one closes.
      if (onlineUsers.get(userId) === socket.id) {
        onlineUsers.delete(userId);
        io.emit('user_offline', { userId });
      }
    });

    // ---- Chat ----

    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on('typing_start', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing_start', { conversationId, userId });
    });

    socket.on('typing_stop', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing_stop', { conversationId, userId });
    });

    socket.on('send_message', async ({ conversationId, text }, callback) => {
      try {
        if (!text || !text.trim()) return;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.some((p) => p.toString() === userId)) {
          return callback?.({ error: 'Conversation not found.' });
        }

        const message = await Message.create({
          conversation: conversationId,
          sender: userId,
          text: text.trim(),
          readBy: [userId],
        });

        conversation.lastMessage = { text: message.text, sender: userId, sentAt: message.createdAt };
        await conversation.save();

        const payload = {
          id: message._id,
          conversationId,
          sender: userId,
          text: message.text,
          createdAt: message.createdAt,
        };

        io.to(`conversation:${conversationId}`).emit('receive_message', payload);
        callback?.({ message: payload });
      } catch (error) {
        callback?.({ error: 'Could not send your message. Please try again.' });
      }
    });

    socket.on('message_read', async ({ conversationId, messageId }) => {
      try {
        await Message.updateOne({ _id: messageId }, { $addToSet: { readBy: userId } });
        socket.to(`conversation:${conversationId}`).emit('message_read', { messageId, userId });
      } catch (error) {
        // Read receipts are best-effort — a failure here shouldn't disrupt the chat.
      }
    });

    // ---- WebRTC signaling (1-to-1 video/audio sessions) ----

    socket.on('call_offer', ({ toUserId, offer, fromName }) => {
      const targetSocket = onlineUsers.get(toUserId);
      if (targetSocket) {
        io.to(targetSocket).emit('call_offer', { fromUserId: userId, offer, fromName });
      }
    });

    socket.on('call_answer', ({ toUserId, answer }) => {
      const targetSocket = onlineUsers.get(toUserId);
      if (targetSocket) {
        io.to(targetSocket).emit('call_answer', { fromUserId: userId, answer });
      }
    });

    socket.on('ice_candidate', ({ toUserId, candidate }) => {
      const targetSocket = onlineUsers.get(toUserId);
      if (targetSocket) {
        io.to(targetSocket).emit('ice_candidate', { fromUserId: userId, candidate });
      }
    });

    socket.on('call_end', ({ toUserId }) => {
      const targetSocket = onlineUsers.get(toUserId);
      if (targetSocket) {
        io.to(targetSocket).emit('call_end', { fromUserId: userId });
      }
    });
  });

  return io;
}
