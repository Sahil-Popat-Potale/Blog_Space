// middlewares/admin.js
export function requireAdmin(req, res, next) {
  if (!req.user || String(req.user.role).toLowerCase() !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}
