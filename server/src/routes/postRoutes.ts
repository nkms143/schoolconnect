import { Router } from 'express';
import {
  getFeed,
  createPost,
  toggleLike,
  addComment,
  getComments,
  deletePost
} from '../controllers/postController.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { sendSuccess } from '../utils/response.js';

const router = Router();

router.get('/feed', authenticate, getFeed);
router.post('/', authenticate, createPost);
router.post('/:postId/like', authenticate, toggleLike);
router.post('/:postId/comments', authenticate, addComment);
router.get('/:postId/comments', authenticate, getComments);
router.delete('/:postId', authenticate, deletePost);

// Direct image upload endpoint
router.post('/upload', authenticate, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  return sendSuccess(res, 'Image uploaded successfully.', { url: fileUrl });
});

export default router;
