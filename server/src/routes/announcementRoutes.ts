import { Router } from 'express';
import {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement
} from '../controllers/announcementController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = Router();

router.get('/', authenticate, getAnnouncements);
router.post('/', authenticate, requireRole(['TEACHER', 'ADMIN']), createAnnouncement);
router.delete('/:id', authenticate, requireRole(['TEACHER', 'ADMIN']), deleteAnnouncement);

export default router;
