import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { User } from '../models/User.js';
import { isUserOnline } from '../sockets/index.js';

const PUBLIC_FIELDS = 'name username avatar';

export async function listConversations(req, res) {
  try {
    const conversations = await Conversation.find({ participants: req.user.id })
      .populate('participants', PUBLIC_FIELDS)
      .sort({ updatedAt: -1 });

    const result = conversations.map((c) => {
      const other = c.participants.find((p) => p._id.toString() !== req.user.id);
      return {
        id: c._id,
        participant: other
          ? {
              id: other._id,
              name: other.name,
              username: other.username,
              avatar: other.avatar,
              online: isUserOnline(other._id.toString()),
            }
          : null,
        lastMessage: c.lastMessage,
        updatedAt: c.updatedAt,
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Could not load your conversations. Please try again.' });
  }
}

export async function startConversation(req, res) {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'Missing user to message.' });

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, userId], $size: 2 },
    });

    if (!conversation) {
      const other = await User.findById(userId);
      if (!other) return res.status(404).json({ message: 'User not found.' });
      conversation = await Conversation.create({ participants: [req.user.id, userId] });
    }

    res.status(201).json({ id: conversation._id });
  } catch (error) {
    res.status(500).json({ message: 'Could not start that conversation. Please try again.' });
  }
}

export async function getMessages(req, res) {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.some((p) => p.toString() === req.user.id)) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    const messages = await Message.find({ conversation: conversationId }).sort({ createdAt: 1 });

    res.json(
      messages.map((m) => ({
        id: m._id,
        conversationId: m.conversation,
        sender: m.sender,
        text: m.text,
        createdAt: m.createdAt,
        readBy: m.readBy,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: 'Could not load messages. Please try again.' });
  }
}
