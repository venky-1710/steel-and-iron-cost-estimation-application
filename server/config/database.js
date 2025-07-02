import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async () => {
  try {
    const mongoURI = process.env.NODE_ENV === 'test' 
      ? process.env.MONGODB_TEST_URI 
      : process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    logger.info('Attempting to connect to MongoDB...');
    // Hide credentials in logs
    logger.info('MongoDB URI:', mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')); 

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Reduce timeout for faster feedback
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 5, // Maintain a minimum of 5 socket connections
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      retryWrites: true,
      w: 'majority'
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected! Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected!');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (error) {
        logger.error('Error closing MongoDB connection:', error);
        process.exit(1);
      }
    });

    return conn;

  } catch (error) {
    logger.error('Database connection failed:', error.message);
    
    // Provide more specific error messages
    if (error.message.includes('ENOTFOUND')) {
      logger.error('DNS resolution failed. Check your MongoDB URI hostname.');
    } else if (error.message.includes('ECONNREFUSED')) {
      logger.error('Connection refused. Check if MongoDB server is running.');
      logger.error('To install MongoDB locally:');
      logger.error('1. Visit https://www.mongodb.com/try/download/community');
      logger.error('2. Download and install MongoDB Community Server');
      logger.error('3. Start MongoDB service');
    } else if (error.message.includes('authentication failed')) {
      logger.error('Authentication failed. Check your MongoDB credentials.');
    } else if (error.message.includes('timeout')) {
      logger.error('Connection timeout. Check your network connection and MongoDB server status.');
    }
    
    // Don't exit in development, allow server to start without DB
    if (process.env.NODE_ENV === 'development') {
      logger.warn('Starting server without database connection...');
      return null;
    }
    
    throw error; // Let the caller handle the error
  }
};

export default connectDB;