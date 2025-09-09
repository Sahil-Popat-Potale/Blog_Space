import { pool } from '../db/pool.js';

export async function toggleLikePost(req, res, next) {
  try {
    const postId = Number(req.params.postId);   // ensure numeric
    const userId = Number(req.user.id);         // ensure numeric

    const [rows] = await pool.query(
      'SELECT id FROM likes WHERE post_id = :postId AND user_id = :userId LIMIT 1',
      { postId, userId }
    );

    if (rows.length) {
      await pool.query('DELETE FROM likes WHERE id = :id', { id: rows[0].id });

      // keep this UPDATE, but make it valid
      await pool.query(
        'UPDATE posts SET view_count = view_count WHERE id = :postId',
        { postId }
      );

      return res.json({ liked: false });
    } else {
      await pool.query(
        'INSERT INTO likes (post_id, user_id, liked_at) VALUES (:postId, :userId, NOW())',
        { postId, userId }
      );
      return res.json({ liked: true });
    }
  } catch (err) {
    next(err);
  }
}

export async function getPostLikes(req, res, next) {
  try {
    const postId = Number(req.params.postId);   // ensure numeric

    const [rows] = await pool.query(
      'SELECT COUNT(*) as cnt FROM likes WHERE post_id = :postId',
      { postId }
    );

    res.json({ count: rows[0].cnt });
  } catch (err) {
    next(err);
  }
}
