import { Notification } from '../models/Notification.js';

const ACTOR_FIELDS = 'name username avatar';

export async function listNotifications(req, res) {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('actor', ACTOR_FIELDS)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(
      notifications.map((n) => ({
        id: n._id,
        type: n.type,
        message: n.message,
        link: n.link,
        read: n.read,
        actor: n.actor,
        createdAt: n.createdAt,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: 'Could not load notifications. Please try again.' });
  }
}

export async function markNotificationRead(req, res) {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findOne({ _id: notificationId, recipient: req.user.id });
    if (!notification) return res.status(404).json({ message: 'Notification not found.' });

    notification.read = true;
    await notification.save();
    res.json({ message: 'Marked as read.' });
  } catch (error) {
    res.status(500).json({ message: 'Could not update that notification. Please try again.' });
  }
}

export async function markAllNotificationsRead(req, res) {
  try {
    await Notification.updateMany({ recipient: req.user.id, read: false }, { read: true });
    res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    res.status(500).json({ message: 'Could not update your notifications. Please try again.' });
  }
}
