import { pool } from '../db/pool.js';

export async function createComment(req, res, next) {
  const { post_id, content, parent_comment_id } = req.body;
  try {
    const [r] = await pool.query(
      `INSERT INTO comments 
        (content, post_id, user_id, parent_comment_id, like_count, is_approved, created_at) 
       VALUES (:content, :post_id, :user_id, :parent_comment_id, 0, 1, NOW())`,
      {
        content,
        post_id: Number(post_id), // ensure numeric
        user_id: Number(req.user.id), // ensure numeric
        parent_comment_id: parent_comment_id ? Number(parent_comment_id) : null
      }
    );

    const id = r.insertId;
    const [rows] = await pool.query('SELECT * FROM comments WHERE id = :id', { id });
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function getCommentsForPost(req, res, next) {
  try {
    const postId = Number(req.params.postId); // ensure numeric

    const [rows] = await pool.query(
      `SELECT c.*, u.username 
       FROM comments c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.post_id = :postId 
       ORDER BY c.created_at ASC`,
      { postId }
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function deleteComment(req, res, next) {
  try {
    const id = Number(req.params.id); // ensure numeric

    const [rows] = await pool.query('SELECT * FROM comments WHERE id = :id', { id });
    if (!rows.length) return res.status(404).json({ message: 'Not found' });

    if (rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await pool.query('DELETE FROM comments WHERE id = :id', { id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
}
