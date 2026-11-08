import { Router } from 'express';
import {
  getAssignments,
  getAssignmentById,
  createAssignment,
  submitAssignment,
  gradeSubmission,
  deleteAssignment
} from '../controllers/assignmentController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = Router();

router.get('/', authenticate, getAssignments);
router.get('/:id', authenticate, getAssignmentById);

router.post('/', authenticate, requireRole(['TEACHER', 'ADMIN']), createAssignment);
router.post('/:id/submit', authenticate, submitAssignment);
router.post('/submissions/:submissionId/grade', authenticate, requireRole(['TEACHER', 'ADMIN']), gradeSubmission);
router.delete('/:id', authenticate, requireRole(['TEACHER', 'ADMIN']), deleteAssignment);

export default router;

