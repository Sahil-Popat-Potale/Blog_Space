import express from 'express';
import { uploadAvatar, uploadPostImage } from '../controllers/uploadController.js';

const router = express.Router();

// Routes for uploads
router.post('/avatar', uploadAvatar);
router.post('/post', uploadPostImage);

export default router;
