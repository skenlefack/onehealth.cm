const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/db');
const { auth } = require('../middleware/auth');
const { generateVerificationToken, sendVerificationEmail, sendAccountActivatedEmail } = require('../services/emailService');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', [
  body('username').trim().isLength({ min: 3 }).escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { username, email, password, first_name, last_name, lang } = req.body;

    // Check if user exists
    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user with email_verified = false
    const [result] = await db.query(
      `INSERT INTO users (username, email, password, first_name, last_name, email_verified, email_verification_token, email_verification_expires, is_active)
       VALUES (?, ?, ?, ?, ?, FALSE, ?, ?, TRUE)`,
      [username, email, hashedPassword, first_name || '', last_name || '', verificationToken, verificationExpires]
    );

    // Send verification email
    const userName = first_name || username;
    try {
      await sendVerificationEmail(email, userName, verificationToken, lang || 'fr');
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue even if email fails - user can request a new one
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      requiresVerification: true
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = users[0];

    // Check if account is active
    if (user.status !== 'active' || user.is_active === false || user.is_active === 0) {
      return res.status(401).json({ success: false, message: 'Account is deactivated' });
    }

    // Check if email is verified
    if (user.email_verified === false || user.email_verified === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email not verified',
        requiresVerification: true,
        email: user.email
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Update last login
    await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    // Get user permissions from groups
    const [permissions] = await db.query(`
      SELECT DISTINCT p.slug FROM permissions p
      INNER JOIN group_permissions gp ON p.id = gp.permission_id
      INNER JOIN user_groups ug ON gp.group_id = ug.group_id
      WHERE ug.user_id = ?
    `, [user.id]);

    const token = generateToken(user);

    // Remove password from response
    delete user.password;
    delete user.reset_token;
    delete user.reset_token_expires;

    // Add permissions to user object
    user.permissions = permissions.map(p => p.slug);

    res.json({
      success: true,
      message: 'Login successful',
      data: { user, token }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, username, email, first_name, last_name, role, avatar, bio, status, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get user permissions from groups
    const [permissions] = await db.query(`
      SELECT DISTINCT p.slug FROM permissions p
      INNER JOIN group_permissions gp ON p.id = gp.permission_id
      INNER JOIN user_groups ug ON gp.group_id = ug.group_id
      WHERE ug.user_id = ?
    `, [req.user.id]);

    const user = users[0];
    user.permissions = permissions.map(p => p.slug);

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { first_name, last_name, bio, avatar } = req.body;

    await db.query(
      'UPDATE users SET first_name = ?, last_name = ?, bio = ?, avatar = ? WHERE id = ?',
      [first_name, last_name, bio, avatar, req.user.id]
    );

    const [updated] = await db.query(
      'SELECT id, username, email, first_name, last_name, role, avatar, bio FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({ success: true, message: 'Profile updated', data: updated[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/auth/password
// @desc    Change password
// @access  Private
router.put('/password', auth, [
  body('currentPassword').exists(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    const [users] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    
    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/auth/verify-email/:token
// @desc    Verify email address
// @access  Public
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Find user with this token
    const [users] = await db.query(
      'SELECT id, username, email, first_name, email_verification_expires FROM users WHERE email_verification_token = ?',
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid verification token' });
    }

    const user = users[0];

    // Check if token is expired
    if (new Date(user.email_verification_expires) < new Date()) {
      return res.status(400).json({ success: false, message: 'Verification token expired' });
    }

    // Update user to verified
    await db.query(
      'UPDATE users SET email_verified = TRUE, email_verification_token = NULL, email_verification_expires = NULL WHERE id = ?',
      [user.id]
    );

    // Send account activated email
    const userName = user.first_name || user.username;
    try {
      await sendAccountActivatedEmail(user.email, userName, 'fr');
    } catch (emailError) {
      console.error('Failed to send activation email:', emailError);
    }

    res.json({ success: true, message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/auth/resend-verification
// @desc    Resend verification email
// @access  Public
router.post('/resend-verification', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, lang } = req.body;

    // Find user
    const [users] = await db.query(
      'SELECT id, username, first_name, email_verified FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      // Don't reveal if user exists
      return res.json({ success: true, message: 'If your email is registered, you will receive a verification link.' });
    }

    const user = users[0];

    // Check if already verified
    if (user.email_verified) {
      return res.status(400).json({ success: false, message: 'Email is already verified' });
    }

    // Generate new token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.query(
      'UPDATE users SET email_verification_token = ?, email_verification_expires = ? WHERE id = ?',
      [verificationToken, verificationExpires, user.id]
    );

    // Send email
    const userName = user.first_name || user.username;
    await sendVerificationEmail(email, userName, verificationToken, lang || 'fr');

    res.json({ success: true, message: 'Verification email sent' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
