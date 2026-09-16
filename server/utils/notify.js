import { Notification } from '../models/Notification.js';
import { getIO, getSocketForUser } from '../sockets/index.js';

/**
 * Creates a notification in the database and pushes it live over Socket.IO
 * to the recipient, if they're currently connected.
 */
export async function notify({ recipient, actor, type, message, link = '' }) {
  const notification = await Notification.create({ recipient, actor, type, message, link });

  const io = getIO();
  const socketId = getSocketForUser(recipient.toString());
  if (io && socketId) {
    io.to(socketId).emit('notification', {
      id: notification._id,
      type: notification.type,
      message: notification.message,
      link: notification.link,
      read: notification.read,
      createdAt: notification.createdAt,
    });
  }

  return notification;
}
