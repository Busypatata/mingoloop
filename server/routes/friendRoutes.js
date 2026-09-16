import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  sendFriendRequest,
  respondToFriendRequest,
  cancelFriendRequest,
  removeFriend,
  listFriends,
} from '../controllers/friendController.js';

const router = express.Router();

router.get('/', requireAuth, listFriends);
router.post('/request', requireAuth, sendFriendRequest);
router.patch('/request/:requestId', requireAuth, respondToFriendRequest);
router.delete('/request/:requestId', requireAuth, cancelFriendRequest);
router.delete('/:userId', requireAuth, removeFriend);

export default router;
