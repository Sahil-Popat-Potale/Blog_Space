import nodemailer from 'nodemailer';
import { logger } from '../config/logger.js';

export async function sendEmail({ to, subject, text, html }) {
  // If email is not configured, log instead of sending
  if (!process.env.EMAIL_HOST) {
    logger.info('Email not configured, preview:');
    logger.info({ to, subject, text });
    return;
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false, // true for port 465, false for others
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Send email
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  });
}
