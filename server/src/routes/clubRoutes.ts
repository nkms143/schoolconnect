import { Router } from 'express';
import {
  getClubs,
  getClubBySlug,
  joinClub,
  leaveClub,
  createClubDiscussion,
  createClubEvent
} from '../controllers/clubController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getClubs);
router.get('/:slug', authenticate, getClubBySlug);
router.post('/:clubId/join', authenticate, joinClub);
router.post('/:clubId/leave', authenticate, leaveClub);
router.post('/:clubId/discussions', authenticate, createClubDiscussion);
router.post('/:clubId/events', authenticate, createClubEvent);

export default router;
