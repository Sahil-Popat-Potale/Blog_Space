import express from 'express';
import {
  createComment,
  getCommentsForPost,
  deleteComment,
} from '../controllers/commentsController.js';
import { requireAuth } from '../middlewares/auth.js';
import { commentSchema } from '../validators/schemas.js';

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
router.post('/', requireAuth, validate(commentSchema), createComment);
router.get('/post/:postId', getCommentsForPost);
router.delete('/:id', requireAuth, deleteComment);

export default router;
