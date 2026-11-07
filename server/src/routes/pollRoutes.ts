import { Router } from 'express';
import {
  getPolls,
  createPoll,
  votePoll
} from '../controllers/pollController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getPolls);
router.post('/', authenticate, createPoll);
router.post('/:pollId/vote', authenticate, votePoll);

export default router;
