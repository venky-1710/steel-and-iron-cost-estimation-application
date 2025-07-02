import React from 'react';
import './Card.css';

const Card = ({ 
  children, 
  className = '', 
  padding = 'md',
  shadow = 'md',
  border = true,
  hover = false,
  ...props 
}) => {
  const classes = [
    'card',
    `card-padding-${padding}`,
    `card-shadow-${shadow}`,
    border ? 'card-border' : '',
    hover ? 'card-hover' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`card-header ${className}`} {...props}>
    {children}
  </div>
);

const CardContent = ({ children, className = '', ...props }) => (
  <div className={`card-content ${className}`} {...props}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`card-footer ${className}`} {...props}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;