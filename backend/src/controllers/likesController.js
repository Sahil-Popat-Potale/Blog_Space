import { pool } from '../db/pool.js';

/*
 * Toggle like/unlike on a post.
 * - If user has liked → unlike it (delete row)
 * - If user hasn’t liked → like it (insert row)
 */
export async function toggleLikePost(req, res, next) {
  try {
    const postId = Number(req.params.postId);
    const userId = Number(req.user.id);

    if (isNaN(postId) || isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid post or user ID' });
    }

    // Check if like already exists
    const [existing] = await pool.query(
      'SELECT id FROM likes WHERE post_id = :postId AND user_id = :userId LIMIT 1',
      { postId, userId }
    );

    if (existing.length) {
      // Unlike → delete the record
      await pool.query('DELETE FROM likes WHERE id = :id', { id: existing[0].id });

      // Optional: update post stats or trigger recalculation
      await pool.query(
        'UPDATE posts SET updated_at = NOW() WHERE id = :postId',
        { postId }
      );

      return res.json({ liked: false, message: 'Unliked successfully' });
    }

    // Like → insert record
    await pool.query(
      'INSERT INTO likes (post_id, user_id, liked_at) VALUES (:postId, :userId, NOW())',
      { postId, userId }
    );

    return res.json({ liked: true, message: 'Liked successfully' });

  } catch (err) {
    console.error('Error in toggleLikePost:', err);
    next(err);
  }
}

/**
 * Get like count for a post.
 */
export async function getPostLikes(req, res, next) {
  try {
    const postId = Number(req.params.postId);

    if (isNaN(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    const [rows] = await pool.query(
      'SELECT COUNT(*) AS count FROM likes WHERE post_id = :postId',
      { postId }
    );

    return res.json({ count: rows[0]?.count ?? 0 });
  } catch (err) {
    console.error('Error in getPostLikes:', err);
    next(err);
  }
}
