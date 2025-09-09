import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Custom format with stack trace support
const fmt = winston.format.printf(({ level, message, timestamp, stack }) =>
  `${timestamp} ${level}: ${stack || message}`
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info', // allow log level from env
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    fmt
  ),
  transports: [
    new winston.transports.Console({
      handleExceptions: true
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      handleExceptions: true
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      handleExceptions: true
    })
  ],
  exitOnError: false // don’t crash on handled exceptions
});
