import { logger } from '../config/logger.js';

// Handle 404 - Not Found
export function notFound(req, res, next) {
  res.status(404).json({ message: 'Route not found' });
}

// Global error handler
export function errorHandler(err, req, res, next) {
  logger.error(err);

  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error',
  });
}

// Register routes like the welcome route
export function welcomeRoute(app) {
  app.get("/", (req, res) => {
    res.send(`
      <h1>🚀 Blog Space API is running!</h1>
      <p>Available endpoints:</p>
      <ul>
        <li><a href="/health">/health</a> - Health check</li>
        <li><a href="/api/auth/login">/api/auth/login</a> - Login</li>
        <li><a href="/api/auth/register">/api/auth/register</a> - Register</li>
        <li><a href="/api/posts">/api/posts</a> - Posts</li>
      </ul>
    `);
  });
}
