import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { uploadAudio } from '../middleware/uploadAudio.js';
import {
  listConversations,
  startConversation,
  getMessages,
  sendAudioMessage,
  translateMessage,
} from '../controllers/messageController.js';

const router = express.Router();

router.get('/conversations', requireAuth, listConversations);
router.post('/conversations', requireAuth, startConversation);
router.post('/translate', requireAuth, translateMessage);
router.post('/:conversationId/audio', requireAuth, uploadAudio, sendAudioMessage);
router.get('/:conversationId', requireAuth, getMessages);

export default router;
