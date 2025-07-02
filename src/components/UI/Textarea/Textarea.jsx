import React, { forwardRef } from 'react';
import './Textarea.css';

const Textarea = forwardRef(({
  label,
  error,
  placeholder,
  value,
  onChange,
  onBlur,
  disabled = false,
  required = false,
  rows = 4,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`textarea-group ${className}`}>
      {label && (
        <label className="textarea-label">
          {label}
          {required && <span className="textarea-required">*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        className={`textarea-field ${error ? 'textarea-error' : ''}`}
        {...props}
      />
      
      {error && <span className="textarea-error-message">{error}</span>}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;