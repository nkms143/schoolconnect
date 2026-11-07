import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  searchUsers,
  getSuggestedFriends
} from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/search', authenticate, searchUsers);
router.get('/suggestions', authenticate, getSuggestedFriends);
router.get('/:userId', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

export default router;
