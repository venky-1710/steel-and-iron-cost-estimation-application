import fs from 'fs';
import path from 'path';
import os from 'os';

// Create logs directory if it doesn't exist
const logDir = path.dirname(process.env.LOG_FILE_PATH || './logs/app.log');
const auditLogPath = process.env.AUDIT_LOG_PATH || './logs/audit.log';

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

const currentLogLevel = logLevels[process.env.LOG_LEVEL] || 
                        (process.env.NODE_ENV === 'production' ? logLevels.info : logLevels.debug);

// Get system information for error context
const systemInfo = {
  hostname: os.hostname(),
  platform: os.platform(),
  release: os.release(),
  type: os.type(),
  arch: os.arch(),
  nodeVersion: process.version
};

const formatLogMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const pid = process.pid;
  
  // Add stack trace for errors
  if (level === 'error' && meta.error instanceof Error) {
    meta.stackTrace = meta.error.stack;
    meta.errorName = meta.error.name;
    // Avoid circular references in JSON
    delete meta.error;
  }
  
  // Add system info for errors in production
  if (level === 'error' && process.env.NODE_ENV === 'production') {
    meta.system = systemInfo;
  }
  
  const logEntry = {
    timestamp,
    pid,
    level: level.toUpperCase(),
    message,
    ...meta
  };
  return JSON.stringify(logEntry);
};

const writeToFile = (logMessage, isAudit = false) => {
  try {
    const logFile = isAudit ? 
      auditLogPath : 
      process.env.LOG_FILE_PATH || './logs/app.log';
    
    fs.appendFileSync(logFile, logMessage + '\n');
  } catch (err) {
    console.error(`Failed to write to log file: ${err.message}`);
  }
};

const logger = {
  error: (message, meta = {}) => {
    if (currentLogLevel >= logLevels.error) {
      const logMessage = formatLogMessage('error', message, meta);
      console.error(logMessage);
      writeToFile(logMessage);
    }
  },

  warn: (message, meta = {}) => {
    if (currentLogLevel >= logLevels.warn) {
      const logMessage = formatLogMessage('warn', message, meta);
      console.warn(logMessage);
      writeToFile(logMessage);
    }
  },
  
  http: (message, meta = {}) => {
    if (currentLogLevel >= logLevels.http) {
      const logMessage = formatLogMessage('http', message, meta);
      if (process.env.NODE_ENV !== 'production') {
        console.log('\x1b[36m%s\x1b[0m', logMessage); // Cyan color for HTTP logs
      }
      writeToFile(logMessage);
    }
  },
  
  audit: (message, meta = {}) => {
    const logMessage = formatLogMessage('audit', message, {
      ...meta,
      timestamp: new Date().toISOString()
    });
    
    // Always write audit logs regardless of log level
    if (process.env.NODE_ENV !== 'production') {
      console.log('\x1b[35m%s\x1b[0m', logMessage); // Magenta for audit logs
    }
    writeToFile(logMessage, true);
  },

  info: (message, meta = {}) => {
    if (currentLogLevel >= logLevels.info) {
      const logMessage = formatLogMessage('info', message, meta);
      console.log(logMessage);
      writeToFile(logMessage);
    }
  },

  debug: (message, meta = {}) => {
    if (currentLogLevel >= logLevels.debug) {
      const logMessage = formatLogMessage('debug', message, meta);
      console.log(logMessage);
      writeToFile(logMessage);
    }
  },

  // Audit logging for sensitive operations
  audit: (action, userId, details = {}) => {
    const auditMessage = formatLogMessage('audit', `User action: ${action}`, {
      userId,
      action,
      ...details,
      timestamp: new Date().toISOString()
    });
    
    console.log(auditMessage);
    writeToFile(auditMessage);
    
    // Also write to separate audit log file
    const auditLogFile = process.env.AUDIT_LOG_FILE || './logs/audit.log';
    fs.appendFileSync(auditLogFile, auditMessage + '\n');
  }
};

export default logger;