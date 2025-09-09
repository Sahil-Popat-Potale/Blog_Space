import { verifyAccessToken } from '../utils/jwt.js';
import { pool } from '../db/pool.js';

// Middleware to require authentication
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Missing token' });
  }

  try {
    // Verify JWT
    const decoded = verifyAccessToken(token);

    // Check if token is blacklisted
    const [rows] = await pool.query(
      'SELECT id FROM token_blacklist WHERE token = :token LIMIT 1',
      { token }
    );

    if (rows.length) {
      return res.status(401).json({ message: 'Token revoked' });
    }

    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Middleware to require specific roles
export function requireRole(roles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }

    if (!roles.length || roles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({ message: 'Forbidden' });
  };
}
