import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import { authLimiter, passwordResetLimiter } from '../config/security.js';
import { sendEmail, emailTemplates } from '../config/email.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Apply rate limiting to auth routes only if enabled
if (process.env.ENABLE_RATE_LIMITING === 'true') {
  router.use(authLimiter);
}

// Register
router.post('/register', async (req, res) => {
  try {
    console.log('Registration attempt:', { email: req.body.email, role: req.body.role });
    
    const { name, email, phone, password, role, companyName, address } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Check database connection status
    const mongoose = await import('mongoose');
    if (mongoose.default.connection.readyState !== 1) {
      console.error('Database not connected. ReadyState:', mongoose.default.connection.readyState);
      return res.status(503).json({ 
        message: 'Database service temporarily unavailable. Please try again later.',
        error: 'DATABASE_UNAVAILABLE'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Registration failed: User already exists', { email });
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const userData = {
      name,
      email,
      phone,
      password,
      role: role || 'customer'
    };

    // Add trader-specific fields
    if (role === 'trader') {
      if (!companyName || !address) {
        return res.status(400).json({ message: 'Company name and address are required for traders' });
      }
      userData.companyName = companyName;
      userData.address = address;
    }

    console.log('Creating user with data:', { ...userData, password: '[HIDDEN]' });

    const user = new User(userData);
    await user.save();

    console.log('User created successfully:', { id: user._id, email: user.email, role: user.role });

    // Log user registration
    if (process.env.ENABLE_AUDIT_LOGGING === 'true') {
      logger.audit('USER_REGISTERED', user._id, { 
        email: user.email, 
        role: user.role,
        name: user.name 
      });
    }

    // Send welcome email if email service is configured
    if (process.env.ENABLE_EMAIL_VERIFICATION === 'true' && process.env.SMTP_HOST) {
      try {
        const { subject, html } = emailTemplates.welcomeEmail(user.name, user.role);
        await sendEmail(user.email, subject, html);
        console.log('Welcome email sent:', { userId: user._id, email: user.email });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError.message);
      }
    }

    let message = 'Registration successful!';
    if (role === 'trader') {
      message = 'Registration successful! Your account is pending admin approval.';
    }

    res.status(201).json({ 
      message,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation failed', errors: validationErrors });
    }

    // Handle database connection errors
    if (error.name === 'MongooseError' || error.message.includes('buffering timed out')) {
      return res.status(503).json({ 
        message: 'Database connection error. Please try again later.',
        error: 'Service temporarily unavailable'
      });
    }
    
    res.status(500).json({ 
      message: 'Registration failed', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Login attempt with non-existent email:', { email });
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Login attempt with incorrect password:', { userId: user._id, email: user.email });
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if trader is approved
    if (user.role === 'trader' && user.status !== 'active') {
      console.log('Login attempt by unapproved trader:', { userId: user._id, status: user.status });
      return res.status(403).json({ 
        message: 'Your account is pending admin approval',
        status: user.status
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Log successful login
    if (process.env.ENABLE_AUDIT_LOGGING === 'true') {
      logger.audit('USER_LOGIN', user._id, { 
        email: user.email, 
        role: user.role,
        ip: req.ip 
      });
    }

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        companyName: user.companyName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    
    // Handle database connection errors
    if (error.name === 'MongooseError' || error.message.includes('buffering timed out')) {
      return res.status(503).json({ 
        message: 'Database connection error. Please try again later.',
        error: 'Service temporarily unavailable'
      });
    }
    
    res.status(500).json({ 
      message: 'Login failed', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to get user data' });
  }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  // Apply rate limiting only if enabled
  if (process.env.ENABLE_RATE_LIMITING === 'true') {
    passwordResetLimiter(req, res, async () => {
      await handleForgotPassword(req, res);
    });
  } else {
    await handleForgotPassword(req, res);
  }
});

const handleForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      console.log('Password reset attempt for non-existent email:', { email });
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Log password reset request
    if (process.env.ENABLE_AUDIT_LOGGING === 'true') {
      logger.audit('PASSWORD_RESET_REQUESTED', user._id, { 
        email: user.email,
        ip: req.ip 
      });
    }

    // Send reset email if email service is configured
    if (process.env.SMTP_HOST) {
      try {
        const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
        const subject = 'Password Reset - BuildEstimate';
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">Password Reset Request</h2>
            <p>Dear ${user.name},</p>
            <p>You have requested to reset your password. Click the link below to reset it:</p>
            <a href="${resetUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <p>Best regards,<br>BuildEstimate Team</p>
          </div>
        `;
        
        await sendEmail(user.email, subject, html);
        console.log('Password reset email sent:', { userId: user._id });
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError.message);
      }
    }

    res.json({ message: 'Password reset instructions sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to process password reset request' });
  }
};

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findOne({
      _id: decoded.userId,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log('Invalid password reset attempt:', { token });
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Log password reset
    if (process.env.ENABLE_AUDIT_LOGGING === 'true') {
      logger.audit('PASSWORD_RESET_COMPLETED', user._id, { 
        email: user.email,
        ip: req.ip 
      });
    }

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

export default router;