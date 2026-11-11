import { Router } from 'express';
import { recordVisit, getStats } from '../controllers/analyticsController.js';

const router = Router();

// Public analytics routes
router.post('/visit', recordVisit);
router.get('/stats', getStats);

export default router;

