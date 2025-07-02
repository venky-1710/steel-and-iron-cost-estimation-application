import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import './Select.css';

const Select = forwardRef(({
  label,
  error,
  value,
  onChange,
  onBlur,
  disabled = false,
  required = false,
  placeholder = 'Select an option',
  options = [],
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`select-group ${className}`}>
      {label && (
        <label className="select-label">
          {label}
          {required && <span className="select-required">*</span>}
        </label>
      )}
      
      <div className={`select-wrapper ${error ? 'select-error' : ''}`}>
        <select
          ref={ref}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          className="select-field"
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="select-icon" />
      </div>
      
      {error && <span className="select-error-message">{error}</span>}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;