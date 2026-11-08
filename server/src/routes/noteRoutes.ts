import { Router } from 'express';
import {
  getNotes,
  createNote,
  toggleHelpfulVote,
  deleteNote
} from '../controllers/noteController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getNotes);
router.post('/', authenticate, createNote);
router.post('/:id/vote', authenticate, toggleHelpfulVote);
router.delete('/:id', authenticate, deleteNote);

export default router;

