import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  listQuestions,
  createQuestion,
  getQuestion,
  toggleLikeQuestion,
  createAnswer,
  toggleUpvoteAnswer,
} from '../controllers/communityController.js';

const router = express.Router();

router.get('/questions', requireAuth, listQuestions);
router.post('/questions', requireAuth, createQuestion);
router.get('/questions/:questionId', requireAuth, getQuestion);
router.post('/questions/:questionId/like', requireAuth, toggleLikeQuestion);
router.post('/questions/:questionId/answers', requireAuth, createAnswer);
router.post('/answers/:answerId/upvote', requireAuth, toggleUpvoteAnswer);

export default router;
