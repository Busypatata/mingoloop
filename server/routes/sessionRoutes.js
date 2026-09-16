import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { startSession, endSession, listSessions } from '../controllers/sessionController.js';

const router = express.Router();

router.get('/', requireAuth, listSessions);
router.post('/', requireAuth, startSession);
router.patch('/:sessionId/end', requireAuth, endSession);

export default router;
