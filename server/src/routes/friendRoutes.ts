import { Router } from 'express';
import {
  getFriends,
  getPendingRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend
} from '../controllers/friendController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getFriends);
router.get('/pending', authenticate, getPendingRequests);
router.post('/request', authenticate, sendFriendRequest);
router.put('/request/:requestId/accept', authenticate, acceptFriendRequest);
router.put('/request/:requestId/reject', authenticate, rejectFriendRequest);
router.delete('/:friendshipId', authenticate, removeFriend);

export default router;
