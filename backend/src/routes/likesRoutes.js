import express from 'express';
import { toggleLikePost, getPostLikes } from '../controllers/likesController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = express.Router();

// Toggle like on a post
router.post('/post/:postId/toggle', requireAuth, toggleLikePost);

// Get all likes for a post
router.get('/post/:postId', getPostLikes);

export default router;
