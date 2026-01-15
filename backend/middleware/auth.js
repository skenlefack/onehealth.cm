const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    const [users] = await db.query('SELECT id, username, email, role, status FROM users WHERE id = ?', [decoded.id]);

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    if (users[0].status !== 'active') {
      return res.status(401).json({ success: false, message: 'Account is not active.' });
    }

    // Get user permissions from groups
    const [permissions] = await db.query(`
      SELECT DISTINCT p.slug FROM permissions p
      INNER JOIN group_permissions gp ON p.id = gp.permission_id
      INNER JOIN user_groups ug ON gp.group_id = ug.group_id
      WHERE ug.user_id = ?
    `, [users[0].id]);

    req.user = users[0];
    req.user.permissions = permissions.map(p => p.slug);
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired.' });
    }
    res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

// Check if user has required role (legacy support)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.'
      });
    }
    next();
  };
};

// Check if user has required permission
const requirePermission = (...permissions) => {
  return (req, res, next) => {
    const hasPermission = permissions.some(perm => req.user.permissions.includes(perm));
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.'
      });
    }
    next();
  };
};

// Optional auth - doesn't require authentication but attaches user if token is valid
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const [users] = await db.query('SELECT id, username, email, role FROM users WHERE id = ?', [decoded.id]);
      
      if (users.length > 0) {
        req.user = users[0];
      }
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = { auth, authorize, requirePermission, optionalAuth };
