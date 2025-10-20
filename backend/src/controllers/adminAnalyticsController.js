import { pool } from '../db/pool.js';

/**
 * 1️⃣ Overview analytics – total counts
 */
export async function adminAnalyticsOverview(req, res, next) {
  try {
    const [[users]] = await pool.query('SELECT COUNT(*) AS total FROM users');
    const [[posts]] = await pool.query('SELECT COUNT(*) AS total FROM posts');
    const [[comments]] = await pool.query('SELECT COUNT(*) AS total FROM comments');
    const [[likes]] = await pool.query('SELECT COUNT(*) AS total FROM likes');

    res.json({
      totals: {
        users: users.total,
        posts: posts.total,
        comments: comments.total,
        likes: likes.total,
      },
    });
  } catch (err) {
    console.error('Error in adminAnalyticsOverview:', err);
    next(err);
  }
}

/**
 * 2️⃣ Time-series trend analytics
 * Return daily counts for the last 7–30 days
 */
export async function adminAnalyticsTrends(req, res, next) {
  try {
    const days = Number(req.query.days) || 7;

    const queryTemplate = (table, dateCol = 'created_at') => `
      SELECT DATE(${dateCol}) AS date, COUNT(*) AS count
      FROM ${table}
      WHERE ${dateCol} >= DATE_SUB(CURDATE(), INTERVAL :days DAY)
      GROUP BY DATE(${dateCol})
      ORDER BY date ASC
    `;

    const [userTrend] = await pool.query(queryTemplate('users'), { days });
    const [postTrend] = await pool.query(queryTemplate('posts'), { days });
    const [commentTrend] = await pool.query(queryTemplate('comments'), { days });
    const [likeTrend] = await pool.query(queryTemplate('likes', 'liked_at'), { days });

    res.json({
      range: `${days} days`,
      users: userTrend,
      posts: postTrend,
      comments: commentTrend,
      likes: likeTrend,
    });
  } catch (err) {
    console.error('Error in adminAnalyticsTrends:', err);
    next(err);
  }
}

/**
 * 3️⃣ Top content – most liked posts & active users
 */
export async function adminAnalyticsTop(req, res, next) {
  try {
    // Top 5 posts by likes
    const [topPosts] = await pool.query(`
      SELECT p.id, p.title, u.username, COUNT(l.id) AS likes
      FROM posts p
      JOIN users u ON p.author_id = u.id
      LEFT JOIN likes l ON p.id = l.post_id
      GROUP BY p.id, p.title, u.username
      ORDER BY likes DESC
      LIMIT 5
    `);

    // Top 5 users by posts
    const [topUsers] = await pool.query(`
      SELECT u.id, u.username, COUNT(p.id) AS post_count
      FROM users u
      LEFT JOIN posts p ON u.id = p.author_id
      GROUP BY u.id, u.username
      ORDER BY post_count DESC
      LIMIT 5
    `);

    res.json({ topPosts, topUsers });
  } catch (err) {
    console.error('Error in adminAnalyticsTop:', err);
    next(err);
  }
}
