import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  completeOnboarding,
  updateProfile,
  discoverUsers,
} from '../controllers/userController.js';

const router = express.Router();

router.post('/onboarding', requireAuth, completeOnboarding);
router.put('/me', requireAuth, updateProfile);
router.get('/discover', requireAuth, discoverUsers);

export default router;
