import express from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { requireAdmin } from '../middlewares/admin.js';

import {
  adminListUsers,
  adminUpdateUser,
  adminListPosts,
  adminApprovePost,
  adminDeletePost,
  adminListComments,
  adminDeleteComment,
  adminAnalytics,
  adminListLikes, // if needed
} from '../controllers/adminController.js';
import analyticsRoutes from './adminAnalyticsRoutes.js';

const router = express.Router();

// Protect all admin routes
router.use(requireAuth, requireAdmin);

// Users
router.get('/users', adminListUsers); // pagination, search
router.put('/users/:id', adminUpdateUser); // edit role, ban/unban

// Posts
router.get('/posts', adminListPosts);
router.put('/posts/:id/approve', adminApprovePost);
router.delete('/posts/:id', adminDeletePost);

// Comments
router.get('/comments', adminListComments);
router.delete('/comments/:id', adminDeleteComment);

// Analytics
router.get('/analytics', adminAnalytics);
router.use('/analytics', analyticsRoutes);

// Likes (optional, for moderation)
router.get('/post/:postId/likes', adminListLikes);

export default router;
