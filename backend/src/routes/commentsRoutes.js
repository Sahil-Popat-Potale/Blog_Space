import express from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { commentSchema } from '../validators/schemas.js';
import {
  getPostComments,
  addComment,
  updateComment,
  deleteComment,
} from '../controllers/commentsController.js';

const router = express.Router();

router.get('/posts/:postId/comments', getPostComments);
router.post('/posts/:postId/comments', requireAuth, addComment);
router.put('/comments/:id', requireAuth, updateComment);
router.delete('/comments/:id', requireAuth, deleteComment);

export default router;
