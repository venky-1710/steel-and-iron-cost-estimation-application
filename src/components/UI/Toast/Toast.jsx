import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import './Toast.css';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 5000, options = {}) => {
    const id = Date.now() + Math.random();
    
    const toast = { 
      id, 
      message, 
      type, 
      duration,
      title: options.title || getDefaultTitle(type),
      detail: options.detail || '',
      action: options.action || null,
      timestamp: new Date()
    };
    
    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);
  
  // Helper to get default toast titles based on type
  const getDefaultTitle = (type) => {
    switch (type) {
      case 'success': return 'Success';
      case 'error': return 'Error';
      case 'warning': return 'Warning';
      case 'info': return 'Information';
      default: return 'Notification';
    }
  };

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback(
    (message, durationOrOptions, maybeOptions) => {
      const { duration, options } = processDurationAndOptions(durationOrOptions, maybeOptions);
      return addToast(message, 'success', duration, options);
    }, 
    [addToast]
  );
  
  const error = useCallback(
    (message, durationOrOptions, maybeOptions) => {
      const { duration, options } = processDurationAndOptions(durationOrOptions, maybeOptions);
      return addToast(message, 'error', duration, options);
    }, 
    [addToast]
  );
  
  const warning = useCallback(
    (message, durationOrOptions, maybeOptions) => {
      const { duration, options } = processDurationAndOptions(durationOrOptions, maybeOptions);
      return addToast(message, 'warning', duration, options);
    }, 
    [addToast]
  );
  
  const info = useCallback(
    (message, durationOrOptions, maybeOptions) => {
      const { duration, options } = processDurationAndOptions(durationOrOptions, maybeOptions);
      return addToast(message, 'info', duration, options);
    }, 
    [addToast]
  );
  
  // Helper to process duration and options arguments
  const processDurationAndOptions = (durationOrOptions, maybeOptions) => {
    if (typeof durationOrOptions === 'number') {
      return { duration: durationOrOptions, options: maybeOptions || {} };
    }
    
    if (typeof durationOrOptions === 'object') {
      return { duration: durationOrOptions.duration || 5000, options: durationOrOptions };
    }
    
    return { duration: 5000, options: {} };
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

const Toast = ({ toast, onRemove }) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="toast-icon" />;
      case 'error':
        return <AlertCircle className="toast-icon" />;
      case 'warning':
        return <AlertTriangle className="toast-icon" />;
      default:
        return <Info className="toast-icon" />;
    }
  };
  
  // Format the timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`toast toast-${toast.type}`}>
      {getIcon()}
      
      <div className="toast-content">
        <div className="toast-header">
          <span className="toast-title">{toast.title}</span>
          <span className="toast-timestamp">{formatTime(toast.timestamp)}</span>
        </div>
        
        <span className="toast-message">{toast.message}</span>
        
        {toast.detail && (
          <span className="toast-detail">{toast.detail}</span>
        )}
        
        {toast.action && (
          <div className="toast-action">
            <button onClick={() => {
              toast.action.onClick();
              onRemove(toast.id);
            }}>
              {toast.action.label}
            </button>
          </div>
        )}
      </div>
      
      <button 
        className="toast-close"
        onClick={() => onRemove(toast.id)}
        aria-label="Close notification"
      >
        <X />
      </button>
    </div>
  );
};