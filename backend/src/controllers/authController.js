import crypto from 'crypto';
import { pool } from '../db/pool.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { sendEmail } from '../utils/email.js';
import { logger } from '../config/logger.js';

function parseExpiryToMs(str) {
  if (!str) return 7 * 24 * 3600000;
  const m = ('' + str).match(/^(\d+)([smhd])$/);
  if (!m) return 7 * 24 * 3600000;
  const val = Number(m[1]);
  const unit = m[2];
  switch (unit) {
    case 's': return val * 1000;
    case 'm': return val * 60000;
    case 'h': return val * 3600000;
    case 'd': return val * 86400000;
    default: return 7 * 24 * 3600000;
  }
}

export async function register(req, res, next) {
  const { username, email, password } = req.body;
  try {
    const [u] = await pool.query(
      'SELECT id FROM users WHERE username = :username OR email = :email',
      { username, email }
    );
    if (u.length) return res.status(409).json({ message: 'Username or email exists' });

    const hashed = await hashPassword(password);

    const [result] = await pool.query(
      `INSERT INTO users (username, email, password, role, is_email_verified, created_at, updated_at) 
       VALUES (:username, :email, :password, 'user', 0, NOW(), NOW())`,
      { username, email, password: hashed }
    );

    const userId = result.insertId;
    const accessToken = signAccessToken({ id: userId, role: 'user' });
    const refreshToken = signRefreshToken({ id: userId, role: 'user' });
    const expiresMs = parseExpiryToMs(process.env.REFRESH_TOKEN_EXPIRES_IN || '7d');
    const expiresAt = new Date(Date.now() + expiresMs);

    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (:user_id, :token, :expires_at)',
      { user_id: userId, token: refreshToken, expires_at: expiresAt }
    );

    res.status(201).json({
      user: { id: userId, username, email, role: 'user' },
      tokens: { accessToken, refreshToken }
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  const { identifier, password } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, password, role FROM users WHERE username = :id OR email = :id LIMIT 1',
      { id: identifier }
    );
    if (!rows.length) return res.status(401).json({ message: 'Invalid credentials' });

    const user = rows[0];
    const ok = await comparePassword(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const accessToken = signAccessToken({ id: user.id, role: user.role });
    const refreshToken = signRefreshToken({ id: user.id, role: user.role });
    const expiresMs = parseExpiryToMs(process.env.REFRESH_TOKEN_EXPIRES_IN || '7d');
    const expiresAt = new Date(Date.now() + expiresMs);

    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (:user_id, :token, :expires_at)',
      { user_id: user.id, token: refreshToken, expires_at: expiresAt }
    );

    res.json({
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
      tokens: { accessToken, refreshToken }
    });
  } catch (err) {
    next(err);
  }
}

export async function profile(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, role, bio, avatar_url, is_email_verified, created_at, updated_at FROM users WHERE id = :id',
      { id: req.user.id }
    );
    if (!rows.length) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function refreshToken(req, res, next) {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: 'Missing refreshToken' });

  try {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const [rows] = await pool.query(
      'SELECT id, user_id, revoked, expires_at FROM refresh_tokens WHERE token = :token LIMIT 1',
      { token: refreshToken }
    );
    if (!rows.length) return res.status(401).json({ message: 'Refresh token not found' });

    const rec = rows[0];
    if (rec.revoked) return res.status(401).json({ message: 'Refresh token revoked' });
    if (new Date(rec.expires_at) < new Date()) return res.status(401).json({ message: 'Refresh token expired' });

    await pool.query('UPDATE refresh_tokens SET revoked = 1 WHERE id = :id', { id: rec.id });

    const newAccessToken = signAccessToken({ id: rec.user_id, role: payload.role });
    const newRefreshToken = signRefreshToken({ id: rec.user_id, role: payload.role });
    const expiresMs = parseExpiryToMs(process.env.REFRESH_TOKEN_EXPIRES_IN || '7d');
    const expiresAt = new Date(Date.now() + expiresMs);

    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (:user_id, :token, :expires_at)',
      { user_id: rec.user_id, token: newRefreshToken, expires_at: expiresAt }
    );

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  const { refreshToken } = req.body;
  const authHeader = req.headers.authorization || '';
  const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  try {
    if (refreshToken) {
      await pool.query('UPDATE refresh_tokens SET revoked = 1 WHERE token = :token', { token: refreshToken });
    }

    if (accessToken) {
      try {
        const parts = accessToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          const exp = payload.exp ? new Date(payload.exp * 1000) : new Date(Date.now() + 15 * 60 * 1000);
          await pool.query(
            'INSERT INTO token_blacklist (token, expires_at) VALUES (:token, :expires_at)',
            { token: accessToken, expires_at: exp }
          );
        }
      } catch (e) {
        logger.warn('Failed to parse access token for blacklist');
      }
    }

    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  const { email } = req.body;
  try {
    const [rows] = await pool.query('SELECT id, email FROM users WHERE email = :email LIMIT 1', { email });
    if (!rows.length) return res.json({ message: 'If that email exists, a reset link has been sent' });

    const user = rows[0];
    const token = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await pool.query(
      'INSERT INTO password_resets (user_id, reset_token, expires_at) VALUES (:user_id, :reset_token, :expires_at)',
      { user_id: user.id, reset_token: hashed, expires_at: expiresAt }
    );

    const resetLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Password reset',
        text: `Reset: ${resetLink}`,
        html: `<a href="${resetLink}">${resetLink}</a>`
      });
    } catch (e) {
      logger.warn('Failed to send email: ' + (e && e.message));
    }

    res.json({ message: 'If that email exists, a reset link has been sent' });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ message: 'Missing token or newPassword' });

  try {
    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const [rows] = await pool.query(
      'SELECT id, user_id, expires_at FROM password_resets WHERE reset_token = :token LIMIT 1',
      { token: hashed }
    );

    if (!rows.length) return res.status(400).json({ message: 'Invalid or expired token' });
    const rec = rows[0];
    if (new Date(rec.expires_at) < new Date()) return res.status(400).json({ message: 'Token expired' });

    const newHashed = await hashPassword(newPassword);
    await pool.query('UPDATE users SET password = :password WHERE id = :id', { password: newHashed, id: rec.user_id });
    await pool.query('DELETE FROM password_resets WHERE user_id = :user_id', { user_id: rec.user_id });
    await pool.query('UPDATE refresh_tokens SET revoked = 1 WHERE user_id = :user_id', { user_id: rec.user_id });

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    next(err);
  }
}
