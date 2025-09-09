import express from 'express';
import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  approvePost,
} from '../controllers/postsController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { postSchema } from '../validators/schemas.js';

const router = express.Router();

// Validation middleware
function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        message: 'Validation failed',
        details: error.details,
      });
    }

    next();
  };
}

// Routes
router.get('/', getPosts);
router.post('/', requireAuth, validate(postSchema), createPost);
router.get('/:id', getPost);
router.put('/:id', requireAuth, validate(postSchema), updatePost);
router.delete('/:id', requireAuth, deletePost);
router.patch('/:id/approve', requireAuth, requireRole(['admin']), approvePost);

export default router;
