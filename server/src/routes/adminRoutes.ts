import { Router } from 'express';
import {
  getPlatformStats,
  getAllUsers,
  toggleUserBlock,
  createNewClub,
  getReports,
  createReport
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = Router();

// Student/Teacher/Admin can report inappropriate content
router.post('/reports', authenticate, createReport);

// Admin-only management endpoints
router.get('/stats', authenticate, requireRole('ADMIN'), getPlatformStats);
router.get('/users', authenticate, requireRole('ADMIN'), getAllUsers);
router.put('/users/:userId/toggle-block', authenticate, requireRole('ADMIN'), toggleUserBlock);
router.post('/clubs', authenticate, requireRole('ADMIN'), createNewClub);
router.get('/reports', authenticate, requireRole(['TEACHER', 'ADMIN']), getReports);

export default router;
