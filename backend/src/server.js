import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { logger } from './config/logger.js';
import { notFound, errorHandler, welcomeRoute } from './middlewares/error.js';
import { pingDB } from './db/pool.js';
import authRoutes from './routes/authRoutes.js';
import postsRoutes from './routes/postsRoutes.js';
import commentsRoutes from './routes/commentsRoutes.js';
import likesRoutes from './routes/likesRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import path from 'path';

const app = express();
const PORT = process.env.PORT;
const CLIENT_URL = process.env.CLIENT_URL;

// Security & middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));

// Rate limiting for auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
});
app.use('/api/auth', authLimiter);

// Health check route
app.get('/health', async (req, res) => {
  try {
    await pingDB();
    res.json({ status: 'ok' });
  } catch (e) {
    res.status(500).json({ status: 'db_error' });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/likes', likesRoutes);
app.use('/api/upload', uploadRoutes);

// Serve static uploads
app.use('/uploads', express.static(path.join(path.resolve(), 'uploads')));

// Welcome route
welcomeRoute(app);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, async () => {
  logger.info(`📡 Blog_Space backend listening on port ${PORT}`);
  logger.info(`⚙️  API URL: http://localhost:${PORT}`);
  logger.info(`💻 Frontend URL: ${CLIENT_URL}`)

  try {
    await pingDB();
    logger.info('Connected to MySQL successfully.');
  } catch (e) {
    logger.error(
      'Failed to connect to MySQL. Have you created the DB and set env vars?'
    );
  }
});
