import { pool } from '../db/pool.js';

// USERS
export async function adminListUsers(req, res, next) {
  const [rows] = await pool.query(
    'SELECT id, username, email, role, is_email_verified, created_at FROM users ORDER BY created_at DESC LIMIT 100'
  );
  res.json(rows);
}

export async function adminUpdateUser(req, res, next) {
  const id = Number(req.params.id);
  const { role, ban } = req.body; // ban can mean disabled/locked (extend table if needed)
  await pool.query('UPDATE users SET role = :role WHERE id = :id', { role, id });
  res.json({ message: 'User updated.' });
}

// POSTS
export async function adminListPosts(req, res, next) {
  const [rows] = await pool.query(
    'SELECT * FROM posts ORDER BY created_at DESC LIMIT 100'
  );
  res.json(rows);
}

export async function adminApprovePost(req, res, next) {
  const id = Number(req.params.id);
  await pool.query('UPDATE posts SET is_approved = 1 WHERE id = :id', { id });
  res.json({ message: 'Post approved.' });
}

export async function adminDeletePost(req, res, next) {
  const id = Number(req.params.id);
  await pool.query('DELETE FROM posts WHERE id = :id', { id });
  res.json({ message: 'Post deleted.' });
}

// COMMENTS
export async function adminListComments(req, res, next) {
  const [rows] = await pool.query(
    'SELECT * FROM comments ORDER BY created_at DESC LIMIT 100'
  );
  res.json(rows);
}

export async function adminDeleteComment(req, res, next) {
  const id = Number(req.params.id);
  await pool.query('DELETE FROM comments WHERE id = :id', { id });
  res.json({ message: 'Comment deleted.' });
}

// ANALYTICS
export async function adminAnalytics(req, res, next) {
  const [[{ user_count }]] = await pool.query('SELECT COUNT(*) AS user_count FROM users');
  const [[{ post_count }]] = await pool.query('SELECT COUNT(*) AS post_count FROM posts');
  const [[{ comment_count }]] = await pool.query('SELECT COUNT(*) AS comment_count FROM comments');
  res.json({ user_count, post_count, comment_count });
}

// LIKES
export async function adminListLikes(req, res, next) {
  const postId = Number(req.params.postId);
  const [rows] = await pool.query(
    'SELECT * FROM likes WHERE post_id = :postId',
    { postId }
  );
  res.json(rows);
}
// Additional admin functions can be added as needed