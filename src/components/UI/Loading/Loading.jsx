import React from 'react';
import './Loading.css';

const Loading = ({ 
  size = 'md', 
  color = 'primary', 
  text = '',
  fullScreen = false,
  overlay = false 
}) => {
  const spinnerClasses = [
    'loading-spinner',
    `loading-${size}`,
    `loading-${color}`
  ].join(' ');

  const content = (
    <div className="loading-content">
      <div className={spinnerClasses}>
        <div className="loading-ring"></div>
        <div className="loading-ring"></div>
        <div className="loading-ring"></div>
        <div className="loading-ring"></div>
      </div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        {content}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="loading-overlay">
        {content}
      </div>
    );
  }

  return content;
};

export default Loading;