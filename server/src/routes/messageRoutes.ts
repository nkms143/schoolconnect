import { Router } from 'express';
import {
  getConversations,
  getMessagesWithUser,
  sendMessage
} from '../controllers/messageController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/conversations', authenticate, getConversations);
router.get('/user/:targetUserId', authenticate, getMessagesWithUser);
router.post('/', authenticate, sendMessage);

export default router;
