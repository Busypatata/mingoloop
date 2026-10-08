import fs from 'fs';
import mongoose from 'mongoose';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { User } from '../models/User.js';
import { getIO, isUserOnline } from '../sockets/index.js';
import { isLanguageMatch } from '../utils/matching.js';
import { MAX_AUDIO_SECONDS } from '../middleware/uploadAudio.js';
import { DEFAULT_TARGET_LANGUAGE, TranslateError, languageCode, translateText } from '../utils/translate.js';

const VOICE_MESSAGE_PREVIEW = 'Voice message';

function discardUpload(file) {
  if (file?.path) fs.unlink(file.path, () => {});
}

const PUBLIC_FIELDS = 'name username avatar showOnlineStatus';

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
              online: other.showOnlineStatus === false ? false : isUserOnline(other._id.toString()),
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

      // Only gates the start of a *new* conversation — an existing thread
      // (found above) is never blocked by a later settings change.
      if (other.messagePermission === 'Nobody') {
        return res.status(403).json({ message: "This person isn't accepting new messages right now." });
      }
      if (other.messagePermission === 'Matches' && !isLanguageMatch(req.user, other)) {
        return res
          .status(403)
          .json({ message: 'This person only accepts messages from language matches.' });
      }

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
        audioUrl: m.audioUrl,
        audioDuration: m.audioDuration,
        createdAt: m.createdAt,
        readBy: m.readBy,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: 'Could not load messages. Please try again.' });
  }
}

export async function sendAudioMessage(req, res) {
  try {
    const { conversationId } = req.params;

    if (!req.file) return res.status(400).json({ message: 'No voice message was received.' });

    const conversation = mongoose.isValidObjectId(conversationId)
      ? await Conversation.findById(conversationId)
      : null;
    if (!conversation || !conversation.participants.some((p) => p.toString() === req.user.id)) {
      discardUpload(req.file);
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    const duration = Math.min(Math.max(Number(req.body.duration) || 0, 0), MAX_AUDIO_SECONDS);

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user.id,
      audioUrl: `/uploads/audio/${req.file.filename}`,
      audioDuration: duration,
      readBy: [req.user.id],
    });

    conversation.lastMessage = {
      text: VOICE_MESSAGE_PREVIEW,
      sender: req.user.id,
      sentAt: message.createdAt,
    };
    await conversation.save();

    const payload = {
      id: message._id,
      conversationId,
      sender: req.user.id,
      text: '',
      audioUrl: message.audioUrl,
      audioDuration: message.audioDuration,
      createdAt: message.createdAt,
    };

    // Same event text messages use, so both participants see it live.
    getIO()?.to(`conversation:${conversationId}`).emit('receive_message', payload);

    res.status(201).json(payload);
  } catch (error) {
    discardUpload(req.file);
    res.status(500).json({ message: 'Could not send your voice message. Please try again.' });
  }
}

export async function translateMessage(req, res) {
  try {
    const { messageId, target } = req.body;
    if (!messageId || !mongoose.isValidObjectId(messageId)) {
      return res.status(400).json({ message: 'Missing message to translate.' });
    }

    const message = await Message.findById(messageId);
    const conversation = message ? await Conversation.findById(message.conversation) : null;
    if (!message || !conversation || !conversation.participants.some((p) => p.toString() === req.user.id)) {
      return res.status(404).json({ message: 'Message not found.' });
    }
    if (!message.text) {
      return res.status(400).json({ message: 'Only text messages can be translated.' });
    }

    // Translate into the reader's native language unless they ask otherwise.
    const requested = languageCode(target) ? target : null;
    const targetName = requested || req.user.nativeLanguages?.[0]?.language || DEFAULT_TARGET_LANGUAGE;
    const targetCode = languageCode(targetName) || languageCode(DEFAULT_TARGET_LANGUAGE);
    const targetLabel = languageCode(targetName) ? targetName : DEFAULT_TARGET_LANGUAGE;

    const result = await translateText(message.text, targetCode, `${messageId}:${targetCode}`);

    res.json({ text: result.text, sameLanguage: result.sameLanguage, target: targetLabel });
  } catch (error) {
    if (error instanceof TranslateError && error.kind === 'QUOTA') {
      return res.status(429).json({ message: 'Translation limit reached for now. Please try again later.' });
    }
    if (error instanceof TranslateError) {
      return res.status(502).json({ message: 'Translation is unavailable right now. Please try again.' });
    }
    res.status(500).json({ message: 'Could not translate that message. Please try again.' });
  }
}
