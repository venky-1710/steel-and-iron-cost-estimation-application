import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../utils/logger.js';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      logger.warn('Token used for non-existent user', { userId: decoded.userId });
      return res.status(401).json({ message: 'Token is no longer valid.' });
    }

    // Check if user is active
    if (user.status === 'suspended') {
      logger.warn('Suspended user attempted access', { userId: user._id });
      return res.status(403).json({ message: 'Account has been suspended.' });
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      user: user
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      logger.warn('Invalid token used', { error: error.message });
      return res.status(401).json({ message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      logger.warn('Expired token used', { error: error.message });
      return res.status(401).json({ message: 'Token has expired.' });
    }
    
    logger.error('Auth middleware error', { error: error.message, stack: error.stack });
    res.status(500).json({ message: 'Server error during authentication.' });
  }
};

export default auth;