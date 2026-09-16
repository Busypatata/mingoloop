import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  listConversations,
  startConversation,
  getMessages,
} from '../controllers/messageController.js';

const router = express.Router();

router.get('/conversations', requireAuth, listConversations);
router.post('/conversations', requireAuth, startConversation);
router.get('/:conversationId', requireAuth, getMessages);

export default router;
