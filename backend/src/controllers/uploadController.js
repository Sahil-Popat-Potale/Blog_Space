import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Local uploads folder
const upload = multer({
  dest: path.join(__dirname, '..', '..', 'uploads'),
});

// Cloudinary configuration (if enabled)
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Upload avatar
export const uploadAvatar = [
  upload.single('avatar'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file' });
      }

      if (process.env.CLOUDINARY_CLOUD_NAME) {
        const resp = await cloudinary.uploader.upload(req.file.path, {
          folder: 'blog_space/avatars',
        });
        fs.unlinkSync(req.file.path); // remove local temp file
        return res.json({ url: resp.secure_url, public_id: resp.public_id });
      } else {
        const url = `/uploads/${req.file.filename}`;
        return res.json({ url });
      }
    } catch (err) {
      return res.status(500).json({ message: 'Upload failed' });
    }
  },
];

// Upload post image
export const uploadPostImage = [
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file' });
      }

      if (process.env.CLOUDINARY_CLOUD_NAME) {
        const resp = await cloudinary.uploader.upload(req.file.path, {
          folder: 'blog_space/posts',
        });
        fs.unlinkSync(req.file.path); // remove local temp file
        return res.json({ url: resp.secure_url, public_id: resp.public_id });
      } else {
        const url = `/uploads/${req.file.filename}`;
        return res.json({ url });
      }
    } catch (err) {
      return res.status(500).json({ message: 'Upload failed' });
    }
  },
];
