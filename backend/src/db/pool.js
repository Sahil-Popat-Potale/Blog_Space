import mysql from 'mysql2/promise';
import { logger } from '../config/logger.js';

// Ensure required environment variables exist
const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
for (const k of required) {
  if (!process.env[k]) {
    logger.warn(`Missing env ${k}`);
  }
}

// Create a MySQL connection pool
export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  namedPlaceholders: true, // allows `:param` placeholders
});

// Simple DB health check
export async function pingDB() {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
    return true;
  } finally {
    conn.release();
  }
}
