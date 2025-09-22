import { pool } from '../db/pool.js';

/**
 * Helper: get or create tags, return tag IDs (array)
 */
async function upsertTags(tags) {
  if (!tags?.length) return [];
  // Lowercase tags for uniqueness
  const uniqueTags = Array.from(new Set(tags.map(t => t.trim().toLowerCase()).filter(Boolean)));
  if (!uniqueTags.length) return [];
  // Insert new tags (ignore if exists)
  const placeholders = uniqueTags.map(_ => '(?)').join(', ');
  await pool.query(
    `INSERT IGNORE INTO tags (name) VALUES ${placeholders}`,
    uniqueTags
  );
  // Retrieve all tag ids (existing + newly inserted)
  const [rows] = await pool.query(
    `SELECT id, name FROM tags WHERE name IN (${uniqueTags.map(() => '?').join(', ')})`,
    uniqueTags
  );
  return rows.map(r => r.id);
}

/**
 * Helper: set post_tags table for a post id, replacing all tags
 */
async function setPostTags(postId, tagIDs) {
  await pool.query('DELETE FROM post_tags WHERE post_id = ?', [postId]);
  if (tagIDs.length === 0) return;
  const values = tagIDs.map(tagId => [postId, tagId]);
  await pool.query('INSERT INTO post_tags (post_id, tag_id) VALUES ?', [values]);
}

export async function createPost(req, res, next) {
  const { title, content_html, content_markdown, tags = [] } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO posts 
        (title, content_html, content_markdown, author_id, view_count, is_approved, created_at, updated_at) 
       VALUES (:title, :content_html, :content_markdown, :author_id, 0, 0, NOW(), NOW())`,
      {
        title,
        content_html,
        content_markdown,
        author_id: req.user.id
      }
    );
    const postId = result.insertId;
    // Tags: upsert and join
    const tagIDs = await upsertTags(tags);
    await setPostTags(postId, tagIDs);

    // Return new post (with its tags)
    const [rows] = await pool.query('SELECT * FROM posts WHERE id = :id', { id: postId });
    // Fetch tag names
    const [tagRows] = await pool.query(
      `SELECT t.name FROM tags t
       JOIN post_tags pt ON t.id = pt.tag_id
       WHERE pt.post_id = ?`,
      [postId]
    );
    rows[0].tags = tagRows.map(r => r.name);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

/** Get paginated posts, filterable by author or tags */
export async function getPosts(req, res, next) {
  try {
    const limit = parseInt(req.query.limit || 10, 10);
    const offset = parseInt(req.query.offset || 0, 10);
    const author = req.query.author || null;
    const tag = req.query.tag || null; // single tag name
    const tagFilterSql = tag
      ? `AND p.id IN (SELECT pt.post_id FROM post_tags pt JOIN tags t ON pt.tag_id=t.id WHERE t.name=?)`
      : '';
    const authorSql = author ? `AND u.username=?` : '';

    const [rows] = await pool.query(
      `
      SELECT p.*, u.username as author
      FROM posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.is_approved = 1
      ${authorSql}
      ${tagFilterSql}
      ORDER BY p.created_at DESC
      LIMIT ?
      OFFSET ?
      `,
      [
        ...(author ? [author] : []),
        ...(tag ? [tag.toLowerCase()] : []),
        limit, offset
      ]
    );
    // Attach tags for each post (could be batched, not for high-scale but fine for blog)
    for (const post of rows) {
      const [tagRows] = await pool.query(
        `SELECT t.name FROM tags t JOIN post_tags pt ON t.id=pt.tag_id WHERE pt.post_id=?`,
        [post.id]
      );
      post.tags = tagRows.map(r => r.name);
    }
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

/** Get single post by ID */
export async function getPost(req, res, next) {
  try {
    const id = Number(req.params.id);
    const [rows] = await pool.query(
      `
      SELECT p.*, u.username as author 
      FROM posts p 
      JOIN users u ON p.author_id = u.id 
      WHERE p.id = :id`,
      { id }
    );
    if (!rows.length) {
      return res.status(404).json({ message: 'Not found' });
    }
    await pool.query('UPDATE posts SET view_count = view_count + 1 WHERE id = :id', { id });
    // Add tags
    const [tagRows] = await pool.query(
      `SELECT t.name FROM tags t JOIN post_tags pt ON t.id=pt.tag_id WHERE pt.post_id=?`, [id]
    );
    rows[0].tags = tagRows.map(r => r.name);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

/** Update a post (including full tag edit/replace) */
export async function updatePost(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { title, content_html, content_markdown, tags = [] } = req.body;
    const [existing] = await pool.query('SELECT * FROM posts WHERE id = :id', { id });
    if (!existing.length) return res.status(404).json({ message: 'Not found' });
    if (existing[0].author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await pool.query(
      'UPDATE posts SET title = :title, content_html = :content_html, content_markdown = :content_markdown, updated_at = NOW() WHERE id = :id',
      { title, content_html, content_markdown, id }
    );
    // Tags: upsert + replace
    const tagIDs = await upsertTags(tags);
    await setPostTags(id, tagIDs);

    // Add tags to response
    const [rows] = await pool.query('SELECT * FROM posts WHERE id = :id', { id });
    const [tagRows] = await pool.query(
      `SELECT t.name FROM tags t JOIN post_tags pt ON t.id=pt.tag_id WHERE pt.post_id=?`, [id]
    );
    rows[0].tags = tagRows.map(r => r.name);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

/** Delete a post and its tag associations */
export async function deletePost(req, res, next) {
  try {
    const id = Number(req.params.id);
    const [existing] = await pool.query('SELECT * FROM posts WHERE id = :id', { id });
    if (!existing.length) return res.status(404).json({ message: 'Not found' });
    if (existing[0].author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await pool.query('DELETE FROM posts WHERE id = :id', { id }); // ON DELETE CASCADE will clean post_tags
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
}

/** Approve post (admin only) */
export async function approvePost(req, res, next) {
  try {
    const id = Number(req.params.id);
    await pool.query('UPDATE posts SET is_approved = 1 WHERE id = :id', { id });
    res.json({ message: 'Approved' });
  } catch (err) {
    next(err);
  }
}

/** Trending tags for the last N days (or all time if no param) */
export async function trendingTags(req, res, next) {
  try {
    const days = req.query.days ? Number(req.query.days) : 30;
    // Posts created in last N days
    const [rows] = await pool.query(
      `
      SELECT t.name, COUNT(*) as count 
      FROM post_tags pt
      JOIN tags t ON pt.tag_id = t.id
      JOIN posts p ON pt.post_id = p.id
      WHERE p.created_at > DATE_SUB(NOW(), INTERVAL ? DAY)
        AND p.is_approved = 1
      GROUP BY t.name
      ORDER BY count DESC, t.name ASC
      LIMIT 20
      `,
      [days]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

/** Advanced search by multiple tags, author, date range */
export async function advancedSearch(req, res, next) {
  // Input: tags (array, all-must-match), author, start_date, end_date
  try {
    let { tags = [], author, start_date, end_date, limit = 10, offset = 0 } = req.query;
    if (typeof tags === 'string') tags = [tags];
    tags = tags.map(t => t.toLowerCase());
    let baseSQL = `
      SELECT DISTINCT p.*, u.username as author
      FROM posts p
      JOIN users u ON p.author_id=u.id
    `;
    let conds = ['p.is_approved = 1'];
    let params = [];
    if (author) {
      conds.push('u.username = ?');
      params.push(author);
    }
    if (start_date) {
      conds.push('p.created_at >= ?');
      params.push(start_date);
    }
    if (end_date) {
      conds.push('p.created_at <= ?');
      params.push(end_date);
    }
    let havingTagSQL = '';
    if (tags.length) {
      baseSQL += `JOIN post_tags pt ON p.id=pt.post_id JOIN tags t ON pt.tag_id=t.id `;
      conds.push(`t.name IN (${tags.map(() => '?').join(',')})`);
      params.push(...tags);
      // Posts must have ALL tags: count distinct matching tags = tag count
      havingTagSQL = `GROUP BY p.id HAVING COUNT(DISTINCT t.name) = ?`;
      params.push(tags.length);
    }
    const finalSQL = `
      ${baseSQL}
      WHERE ${conds.join(' AND ')}
      ${havingTagSQL}
      ORDER BY p.created_at DESC
      LIMIT ?
      OFFSET ?
    `;
    params.push(Number(limit), Number(offset));
    const [rows] = await pool.query(finalSQL, params);
    // Attach tags
    for (const post of rows) {
      const [tagRows] = await pool.query(
        `SELECT t.name FROM tags t JOIN post_tags pt ON t.id=pt.tag_id WHERE pt.post_id=?`,
        [post.id]
      );
      post.tags = tagRows.map(r => r.name);
    }
    res.json(rows);
  } catch (err) {
    next(err);
  }
}
