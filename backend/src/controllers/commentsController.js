import { pool } from '../db/pool.js';


export async function getPostComments(req, res, next) {
  try {
    const postId = Number(req.params.postId);
    if (isNaN(postId)) return res.status(400).json({ message: 'Invalid post ID' });
 
    const [rows] = await pool.query(
      `SELECT c.id, c.post_id, c.user_id, u.username, c.parent_id, c.content, c.created_at, c.updated_at
       FROM comments c JOIN users u ON c.user_id = u.id WHERE c.post_id = :postId ORDER BY c.created_at ASC`,
      { postId }
    );

    const map = {};
    const roots = [];

    // Map all comments by ID and prepare the 'replies' array
    for (const row of rows) {
      row.replies = []; // Add the replies array directly to the fetched object
      map[row.id] = row;
    }

    // Organize comments into the tree structure
    for (const row of rows) {
      if (row.parent_id && map[row.parent_id]) {
        map[row.parent_id].replies.push(row);
      } else {
        roots.push(row);
      }
    }

    res.json(roots);
  } catch (err) {
    console.error('Error in getPostComments:', err);
    next(err);
  }
}

// Add a new comment/reply
export async function addComment(req, res, next) {
  try {
    const postId = Number(req.params.postId);
    const userId = Number(req.user.id);   
    const { content, parentId } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ message: 'Comment content is required.' });
    }

    // Prepare parentId for SQL: null if not provided or 0
    const finalParentId = (parentId && Number(parentId) > 0) ? Number(parentId) : null;
    const [result] = await pool.query(
      `INSERT INTO comments (post_id, user_id, parent_id, content)
       VALUES (:postId, :userId, :finalParentId, :content)`,
      { postId, userId, finalParentId, content }
    );

    // Fetch created comment (ID, timestamp) and author's username.
    const newCommentId = result.insertId;
    const [rows] = await pool.query(
      `SELECT c.id, u.username, c.parent_id, c.content, c.created_at
       FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = :id`,
      { id: newCommentId }
    );

    // Respond with the created resource
    if (!rows.length) {
        return res.status(500).json({ message: 'Failed to retrieve created comment.' });
    }
    res.status(201).json(rows[0]);

  } catch (err) {
    console.error('Error in addComment:', err);
    next(err);
  }
}

export async function updateComment(req, res, next) {
try {
    const commentId = Number(req.params.id);
    const userId = Number(req.user.id);
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: 'Content required' });
    }

    const [rows] = await pool.query(
      'SELECT user_id FROM comments WHERE id = :id',
      { id: commentId }
    );
    if (!rows.length) return res.status(404).json({ message: 'Comment not found' });
    if (rows[0].user_id !== userId)
      return res.status(403).json({ message: 'Not your comment' });

    await pool.query(
      'UPDATE comments SET content = :content, updated_at = NOW() WHERE id = :id',
      { id: commentId, content }
    );

    res.json({ message: 'Comment updated' });
  } catch (err) {
    console.error('Error in updateComment:', err);
    next(err);
  }
}

export async function deleteComment(req, res, next) {
  try {
    const commentId = Number(req.params.id);

    // Only fetch the user_id for the authorization check
    const [rows] = await pool.query(
      'SELECT user_id FROM comments WHERE id = :id',
      { id: commentId }
    );

    if (!rows.length) return res.status(404).json({ message: 'Comment not found' });

    // Auth: Check if the user is the owner OR an admin
    const isOwner = rows[0].user_id === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden: You are not authorized to delete this comment.' });
    }

    // Deletion
    await pool.query('DELETE FROM comments WHERE id = :id', { id: commentId });
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    next(err);
  }
}
