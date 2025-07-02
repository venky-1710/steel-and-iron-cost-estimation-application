import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

// Import configurations
import connectDB from './config/database.js';
import { helmetConfig, corsOptions, generalLimiter } from './config/security.js';
import logger from './utils/logger.js';

// Import routes
import authRoutes from './routes/auth.js';
import estimateRoutes from './routes/estimates.js';
import invoiceRoutes from './routes/invoices.js';
import userRoutes from './routes/users.js';

const app = express();

// Connect to database with proper error handling
connectDB().then(() => {
  logger.info('Database connected successfully');
}).catch((error) => {
  logger.error('Database connection error:', error);
  // In production, exit if DB connection fails
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Security middleware
app.use(helmetConfig);
app.use(cors(corsOptions));

// Rate limiting (only if enabled)
if (process.env.ENABLE_RATE_LIMITING === 'true') {
  app.use(generalLimiter);
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads
app.use('/uploads', express.static(process.env.UPLOAD_PATH || './uploads'));

// Request logging middleware
app.use((req, res, next) => {
  // Start time of the request for calculating response time
  const startTime = Date.now();
  
  // Log request data
  const logLevel = process.env.ENABLE_AUDIT_LOGGING === 'true' ? 'audit' : 'http';
  const method = logger[logLevel];
  
  // Log when response finishes
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const userId = req.user?.userId || 'anonymous';
    const statusCode = res.statusCode;
    const contentLength = res.get('Content-Length') || 0;
    
    method(`${req.method} ${req.originalUrl}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId,
      statusCode,
      responseTime: `${responseTime}ms`,
      contentLength: `${contentLength} bytes`
    });
    
    // Log detailed information for errors
    if (statusCode >= 400) {
      logger.error(`Request error: ${statusCode}`, {
        method: req.method,
        path: req.originalUrl,
        ip: req.ip,
        userId
      });
    }
  });
  
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/estimates', estimateRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ 
    message: 'Resource not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  // Log error details
  logger.error(`Server error: ${err.message}`, {
    error: err,
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    userId: req.user?.userId || 'anonymous'
  });
  
  // Only include stack trace in non-production environments
  const errorResponse = {
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  };
  
  res.status(statusCode).json(errorResponse);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    database: 'Connected' // You could check actual DB status here
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  // Log error if audit logging is enabled
  if (process.env.ENABLE_AUDIT_LOGGING === 'true') {
    logger.error('Unhandled error:', {
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip
    });
  }

  res.status(err.status || 500).json({ 
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message,
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('Route not found:', { url: req.originalUrl, method: req.method });
  res.status(404).json({ message: 'Route not found' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Client URL: ${process.env.CLIENT_URL}`);
});

export default app;