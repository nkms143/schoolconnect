import { Router } from 'express';
import {
  getQuizzes,
  getQuizById,
  createQuiz,
  submitQuiz,
  getQuizLeaderboard,
  getGlobalLeaderboard,
  deleteQuiz
} from '../controllers/quizController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = Router();

router.get('/', authenticate, getQuizzes);
router.get('/leaderboard/global', authenticate, getGlobalLeaderboard);
router.get('/:id', authenticate, getQuizById);
router.get('/:id/leaderboard', authenticate, getQuizLeaderboard);

router.post('/', authenticate, requireRole(['TEACHER', 'ADMIN']), createQuiz);
router.post('/:id/submit', authenticate, submitQuiz);
router.delete('/:id', authenticate, requireRole(['TEACHER', 'ADMIN']), deleteQuiz);

export default router;

