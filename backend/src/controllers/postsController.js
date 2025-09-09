import { pool } from '../db/pool.js';

// Create a new post
export async function createPost(req, res, next) {
  const { title, content, categories } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO posts 
        (title, content, author_id, view_count, is_approved, created_at, updated_at) 
       VALUES (:title, :content, :author_id, 0, 0, NOW(), NOW())`,
      { title, content, author_id: req.user.id }
    );

    const postId = result.insertId;

    // Insert categories if provided
    if (Array.isArray(categories) && categories.length) {
      const values = categories.map(cid => [postId, Number(cid)]);
      await pool.query(
        'INSERT INTO post_categories (post_id, category_id) VALUES ?',
        [values]
      );
    }

    const [rows] = await pool.query(
      'SELECT * FROM posts WHERE id = :id',
      { id: postId }
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// Get paginated posts (only approved)
export async function getPosts(req, res, next) {
  try {
    const limit = parseInt(req.query.limit || 10);
    const offset = parseInt(req.query.offset || 0);

    const [rows] = await pool.query(
      `SELECT p.*, u.username as author 
       FROM posts p 
       JOIN users u ON p.author_id = u.id 
       WHERE p.is_approved = 1 
       ORDER BY p.created_at DESC 
       LIMIT :limit OFFSET :offset`,
      { limit, offset }
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// Get single post by ID
export async function getPost(req, res, next) {
  try {
    const id = Number(req.params.id);

    const [rows] = await pool.query(
      `SELECT p.*, u.username as author 
       FROM posts p 
       JOIN users u ON p.author_id = u.id 
       WHERE p.id = :id`,
      { id }
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Not found' });
    }

    // Increment view count
    await pool.query('UPDATE posts SET view_count = view_count + 1 WHERE id = :id', { id });

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// Update a post
export async function updatePost(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { title, content, categories } = req.body;

    const [existing] = await pool.query('SELECT * FROM posts WHERE id = :id', { id });

    if (!existing.length) return res.status(404).json({ message: 'Not found' });
    if (existing[0].author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await pool.query(
      'UPDATE posts SET title = :title, content = :content, updated_at = NOW() WHERE id = :id',
      { title, content, id }
    );

    // Update categories if provided
    if (Array.isArray(categories)) {
      await pool.query('DELETE FROM post_categories WHERE post_id = :id', { id });

      if (categories.length) {
        const values = categories.map(cid => [id, Number(cid)]);
        await pool.query(
          'INSERT INTO post_categories (post_id, category_id) VALUES ?',
          [values]
        );
      }
    }

    const [rows] = await pool.query('SELECT * FROM posts WHERE id = :id', { id });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// Delete a post
export async function deletePost(req, res, next) {
  try {
    const id = Number(req.params.id);

    const [existing] = await pool.query('SELECT * FROM posts WHERE id = :id', { id });
    if (!existing.length) return res.status(404).json({ message: 'Not found' });

    if (existing[0].author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await pool.query('DELETE FROM posts WHERE id = :id', { id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
}

// Approve post (admin only)
export async function approvePost(req, res, next) {
  try {
    const id = Number(req.params.id);
    await pool.query('UPDATE posts SET is_approved = 1 WHERE id = :id', { id });
    res.json({ message: 'Approved' });
  } catch (err) {
    next(err);
  }
}
