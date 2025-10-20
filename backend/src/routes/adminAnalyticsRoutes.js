import express from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { requireAdmin } from '../middlewares/admin.js';
import {
  adminAnalyticsOverview,
  adminAnalyticsTrends,
  adminAnalyticsTop,
} from '../controllers/adminAnalyticsController.js';

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get('/overview', adminAnalyticsOverview);
router.get('/trends', adminAnalyticsTrends);
router.get('/top', adminAnalyticsTop);

export default router;
